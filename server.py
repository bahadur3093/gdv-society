# server.py
import os
import logging
from datetime import datetime
from functools import wraps

import psycopg2
import psycopg2.extras  # For RealDictCursor
from dotenv import load_dotenv
from fastmcp import FastMCP

load_dotenv()

# ──────────────────────────────────────────────
# 🔧 CONFIG & LOGGING
# ──────────────────────────────────────────────

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in .env")

logging.basicConfig(
    filename="gdv_audit.log",
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger("gdv-mcp")

mcp = FastMCP("gdv-society")


# ──────────────────────────────────────────────
# 🔌 DATABASE CONNECTION
# ──────────────────────────────────────────────

def get_db():
    """
    Create a new connection to Neon PostgreSQL with SSL.
    Uses RealDictCursor so rows come back as dicts, not tuples.
    
    WHY a new connection each time?
    - MCP tools are called one at a time via stdio
    - Neon's pooler handles connection pooling on their side
    - Keeps it simple and avoids stale connection issues
    """
    conn = psycopg2.connect(
        DATABASE_URL,
        cursor_factory=psycopg2.extras.RealDictCursor
    )
    return conn


def safe_tool(func):
    """
    Decorator that wraps every tool with:
    1. Error handling (so the LLM gets clean error messages, not tracebacks)
    2. Audit logging (every call is logged)
    
    LEARN: This pattern is critical in production. Without it, 
    a DB error would crash the MCP server.
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        logger.info(f"TOOL_CALL: {func.__name__} | args={kwargs}")
        try:
            result = func(*args, **kwargs)
            logger.info(f"TOOL_OK: {func.__name__}")
            return result
        except psycopg2.Error as e:
            logger.error(f"DB_ERROR: {func.__name__} | {e}")
            return {"error": f"Database error: {str(e)}"}
        except Exception as e:
            logger.error(f"ERROR: {func.__name__} | {e}")
            return {"error": f"Unexpected error: {str(e)}"}
    return wrapper


# ══════════════════════════════════════════════
# 📖 READ TOOLS — Safe, no side effects
# ══════════════════════════════════════════════
#
# LEARN: Always build read tools first. They're safe to test,
# easy to debug, and let you verify the DB connection works.
# Write tools come later.
#

@mcp.tool()
@safe_tool
def get_all_villas() -> list[dict]:
    """Get the list of all villas/plots in the society with owner details.
    Returns villa number, type, area, owner name, and remarks."""
    conn = get_db()
    try:
        cur = conn.cursor()
        # NOTE: Prisma creates tables with PascalCase names in PostgreSQL.
        # You MUST use double quotes around table/column names.
        cur.execute("""
            SELECT "villaNo", "type", "areaInSqM", "areaInSqFt", 
                   "ownerName", "remarks"
            FROM "Villa"
            ORDER BY "villaNo"
        """)
        return cur.fetchall()
    finally:
        conn.close()


@mcp.tool()
@safe_tool
def get_villa_details(villa_no: int) -> dict:
    """Get detailed info about a specific villa by its number.
    Args:
        villa_no: The villa/plot number (e.g., 1, 2, 47)
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT "villaNo", "type", "areaInSqM", "areaInSqFt",
                   "ownerName", "remarks"
            FROM "Villa" WHERE "villaNo" = %s
        """, (villa_no,))
        villa = cur.fetchone()
        if not villa:
            return {"error": f"Villa #{villa_no} not found"}
        return dict(villa)
    finally:
        conn.close()


@mcp.tool()
@safe_tool
def get_pending_dues() -> list[dict]:
    """Get all pending (DEBIT) ledger entries that haven't been offset by payments.
    Shows who owes money and how much."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT le.id, le.date, le.description, le.amount, 
                   le.type, le.category, le.balance,
                   u.name as "userName", u."plotNumber"
            FROM "LedgerEntry" le
            LEFT JOIN "User" u ON le."userId" = u.id
            WHERE le.type = 'DEBIT'
            ORDER BY le.date DESC
        """)
        return cur.fetchall()
    finally:
        conn.close()


@mcp.tool()
@safe_tool
def get_ledger(
    user_plot: str = "",
    category: str = "",
    limit: int = 50
) -> list[dict]:
    """Get ledger entries (financial transactions) with optional filters.
    Args:
        user_plot: Filter by plot number (e.g., "A-201"). Leave empty for all.
        category: Filter by category — "CORE_OPERATIONS" or "SINKING_FUND". Leave empty for all.
        limit: Max rows to return (default 50).
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        query = """
            SELECT le.id, le.date, le.description, le.amount,
                   le.type, le.category, le.balance,
                   u.name as "userName", u."plotNumber"
            FROM "LedgerEntry" le
            LEFT JOIN "User" u ON le."userId" = u.id
            WHERE 1=1
        """
        params = []

        if user_plot:
            query += ' AND u."plotNumber" = %s'
            params.append(user_plot)
        if category:
            query += " AND le.category = %s"
            params.append(category)

        query += " ORDER BY le.date DESC LIMIT %s"
        params.append(limit)

        cur.execute(query, params)
        return cur.fetchall()
    finally:
        conn.close()


@mcp.tool()
@safe_tool
def get_monthly_expenses(month: int = 0, year: int = 0) -> list[dict]:
    """Get monthly society expenses (security, electricity, cleaning, etc).
    Args:
        month: Month number 1-12. Leave 0 for all months.
        year: Year like 2026. Leave 0 for all years.
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        query = 'SELECT * FROM "MonthlyExpense" WHERE 1=1'
        params = []

        if month > 0:
            query += " AND month = %s"
            params.append(month)
        if year > 0:
            query += " AND year = %s"
            params.append(year)

        query += " ORDER BY year DESC, month DESC"
        cur.execute(query, params)
        return cur.fetchall()
    finally:
        conn.close()


@mcp.tool()
@safe_tool
def get_financial_summary(month: int, year: int) -> dict:
    """Get a complete financial summary for a specific month.
    Shows total income, expenses, and balance across categories.
    Args:
        month: Month number (1-12)
        year: Year (e.g., 2026)
    """
    conn = get_db()
    try:
        cur = conn.cursor()

        # Total credits (income)
        cur.execute("""
            SELECT COALESCE(SUM(amount), 0) as total
            FROM "LedgerEntry"
            WHERE type = 'CREDIT'
              AND EXTRACT(MONTH FROM date) = %s
              AND EXTRACT(YEAR FROM date) = %s
        """, (month, year))
        total_income = cur.fetchone()["total"]

        # Total debits
        cur.execute("""
            SELECT COALESCE(SUM(amount), 0) as total
            FROM "LedgerEntry"
            WHERE type = 'DEBIT'
              AND EXTRACT(MONTH FROM date) = %s
              AND EXTRACT(YEAR FROM date) = %s
        """, (month, year))
        total_debits = cur.fetchone()["total"]

        # Monthly expenses
        cur.execute("""
            SELECT category, SUM(amount) as total
            FROM "MonthlyExpense"
            WHERE month = %s AND year = %s
            GROUP BY category
            ORDER BY total DESC
        """, (month, year))
        expense_breakdown = cur.fetchall()

        cur.execute("""
            SELECT COALESCE(SUM(amount), 0) as total
            FROM "MonthlyExpense"
            WHERE month = %s AND year = %s
        """, (month, year))
        total_expenses = cur.fetchone()["total"]

        return {
            "month": month,
            "year": year,
            "total_income": float(total_income),
            "total_debits": float(total_debits),
            "total_monthly_expenses": float(total_expenses),
            "expense_breakdown": [dict(r) for r in expense_breakdown],
            "net": float(total_income) - float(total_expenses)
        }
    finally:
        conn.close()


@mcp.tool()
@safe_tool
def get_society_settings() -> dict:
    """Get current society settings — per sq ft rate, sinking fund %, total villas."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT "perSqFtRate", "sinkingFundPercentage", "totalVillas"
            FROM "SocietySettings"
            ORDER BY "updatedAt" DESC LIMIT 1
        """)
        row = cur.fetchone()
        return dict(row) if row else {"error": "No settings found"}
    finally:
        conn.close()


@mcp.tool()
@safe_tool
def get_resident_requests(status: str = "", request_type: str = "") -> list[dict]:
    """Get resident requests/complaints with optional filters.
    Args:
        status: Filter by status — PENDING, IN_PROGRESS, RESOLVED, REJECTED, REOPENED. Leave empty for all.
        request_type: Filter by type — PLOT_SIZE_UPDATE, PAYMENT_ISSUE, EXPENSE_SHEET_MONTHLY, 
                      EXPENSE_SHEET_YEARLY, ADD_FAMILY_MEMBER, PASSWORD_RESET. Leave empty for all.
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        query = """
            SELECT rr.id, rr."plotNumber", rr."requestType", rr.status,
                   rr.description, rr."adminNotes", rr."createdAt", rr."resolvedAt",
                   u.name as "userName"
            FROM "ResidentRequest" rr
            JOIN "User" u ON rr."userId" = u.id
            WHERE 1=1
        """
        params = []
        if status:
            query += " AND rr.status = %s"
            params.append(status)
        if request_type:
            query += ' AND rr."requestType" = %s'
            params.append(request_type)

        query += ' ORDER BY rr."createdAt" DESC LIMIT 50'
        cur.execute(query, params)
        return cur.fetchall()
    finally:
        conn.close()


@mcp.tool()
@safe_tool
def get_family_members(plot_number: str = "") -> list[dict]:
    """Get family members of residents. Optionally filter by plot number.
    Args:
        plot_number: Filter by plot number. Leave empty for all.
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        query = """
            SELECT fm.name, fm.relationship, fm.contact, fm."addedAt",
                   u.name as "residentName", u."plotNumber"
            FROM "FamilyMember" fm
            JOIN "User" u ON fm."userId" = u.id
            WHERE 1=1
        """
        params = []
        if plot_number:
            query += ' AND u."plotNumber" = %s'
            params.append(plot_number)

        query += ' ORDER BY u."plotNumber", fm.name'
        cur.execute(query, params)
        return cur.fetchall()
    finally:
        conn.close()


@mcp.tool()
@safe_tool
def search_residents(search_term: str) -> list[dict]:
    """Search for residents by name or plot number.
    Args:
        search_term: Name or plot number to search for (partial match works).
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT name, email, "plotNumber", role, "createdAt"
            FROM "User"
            WHERE name ILIKE %s OR "plotNumber" ILIKE %s
            ORDER BY name
        """, (f"%{search_term}%", f"%{search_term}%"))
        return cur.fetchall()
    finally:
        conn.close()


# ══════════════════════════════════════════════
# ✏️ WRITE TOOLS — These modify your database!
# ══════════════════════════════════════════════
#
# LEARN: Write tools need extra care:
# 1. Validate ALL inputs before touching the DB
# 2. Log every write operation
# 3. Return clear success/failure messages
# 4. Use transactions (commit only on success)
#

@mcp.tool()
@safe_tool
def record_ledger_entry(
    plot_number: str,
    description: str,
    amount: float,
    transaction_type: str,
    category: str
) -> dict:
    """Record a new financial ledger entry (payment or charge).
    Args:
        plot_number: The plot/villa number of the resident (e.g., "12")
        description: Description of the transaction (e.g., "Maintenance - June 2026")
        amount: Amount in rupees (must be positive)
        transaction_type: "CREDIT" for payments received, "DEBIT" for charges
        category: "CORE_OPERATIONS" or "SINKING_FUND"
    """
    # Input validation
    if transaction_type not in ("CREDIT", "DEBIT"):
        return {"error": "transaction_type must be 'CREDIT' or 'DEBIT'"}
    if category not in ("CORE_OPERATIONS", "SINKING_FUND"):
        return {"error": "category must be 'CORE_OPERATIONS' or 'SINKING_FUND'"}
    if amount <= 0:
        return {"error": "amount must be positive"}

    conn = get_db()
    try:
        cur = conn.cursor()

        # Find the user by plot number
        cur.execute(
            'SELECT id, name FROM "User" WHERE "plotNumber" = %s',
            (plot_number,)
        )
        user = cur.fetchone()
        if not user:
            return {"error": f"No resident found for plot {plot_number}"}

        # Get current balance
        cur.execute("""
            SELECT COALESCE(
                (SELECT balance FROM "LedgerEntry" ORDER BY date DESC, "createdAt" DESC LIMIT 1),
                0
            ) as current_balance
        """)
        current_balance = float(cur.fetchone()["current_balance"])
        
        new_balance = (
            current_balance + amount if transaction_type == "CREDIT"
            else current_balance - amount
        )

        # Insert the entry
        cur.execute("""
            INSERT INTO "LedgerEntry" (id, "userId", date, description, amount, type, category, balance, "createdAt", "updatedAt")
            VALUES (
                gen_random_uuid()::text, %s, NOW(), %s, %s, %s, %s, %s, NOW(), NOW()
            )
            RETURNING id, date, balance
        """, (user["id"], description, amount, transaction_type, category, new_balance))

        result = cur.fetchone()
        conn.commit()

        logger.info(
            f"LEDGER_WRITE: plot={plot_number}, user={user['name']}, "
            f"type={transaction_type}, amount={amount}, category={category}"
        )

        return {
            "success": True,
            "entry_id": result["id"],
            "message": f"₹{amount} {transaction_type} recorded for {user['name']} (Plot {plot_number})",
            "new_balance": float(result["balance"])
        }
    except Exception as e:
        conn.rollback()
        raise
    finally:
        conn.close()


@mcp.tool()
@safe_tool
def add_monthly_expense(
    month: int,
    year: int,
    category: str,
    amount: float,
    description: str = ""
) -> dict:
    """Add a monthly society expense entry.
    Args:
        month: Month number (1-12)
        year: Year (e.g., 2026)
        category: Expense category (e.g., "Security", "Electricity", "Cleaning", "Water", "Maintenance")
        amount: Expense amount in rupees (must be positive)
        description: Optional description of the expense
    """
    if not (1 <= month <= 12):
        return {"error": "month must be between 1 and 12"}
    if amount <= 0:
        return {"error": "amount must be positive"}

    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO "MonthlyExpense" (id, month, year, category, amount, description, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, %s, %s, %s, %s, %s, NOW(), NOW())
            ON CONFLICT (month, year, category) 
            DO UPDATE SET amount = EXCLUDED.amount, description = EXCLUDED.description, "updatedAt" = NOW()
            RETURNING id
        """, (month, year, category, amount, description))
        result = cur.fetchone()
        conn.commit()

        logger.info(f"EXPENSE_WRITE: {month}/{year} {category} ₹{amount}")

        return {
            "success": True,
            "message": f"₹{amount} expense recorded for {category} ({month}/{year})",
            "id": result["id"]
        }
    except Exception as e:
        conn.rollback()
        raise
    finally:
        conn.close()


# ──────────────────────────────────────────────
# 🚀 RUN
# ──────────────────────────────────────────────

if __name__ == "__main__":
    mcp.run()  # stdio transport — the bridge connects here