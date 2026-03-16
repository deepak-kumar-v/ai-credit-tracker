import { getAccounts } from "@/actions/account";
import { Dashboard } from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const accounts = await getAccounts();

  return <Dashboard initialAccounts={accounts} />;
}
