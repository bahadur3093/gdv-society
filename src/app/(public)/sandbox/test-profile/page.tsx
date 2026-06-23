import { getResidentProfile } from "@/lib/users/getResidentProfile";
import { prisma } from "@/lib/prisma";

export default async function TestPage() {
  // Get any resident user from DB
  const anyResident = await prisma.user.findFirst({
    where: { role: "RESIDENT" },
    select: { id: true },
  });

  if (!anyResident) {
    return <p>No residents in DB</p>;
  }

  const data = await getResidentProfile(anyResident.id);
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-h1 text-text-primary">Resident Profile Test</h1>
      <pre className="text-body-sm font-mono whitespace-pre-wrap mt-4 bg-bg-sunken p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
