import Head from "next/head";
import ManagementUsersView from "../../views/management/users";

export default function UsersPage() {
  return (
    <>
      <Head>
        <title>User Management | Smart Plant Auto Watering</title>
        <meta
          name="description"
          content="Manajemen pengguna dan hak akses dashboard irigasi"
        />
      </Head>
      <ManagementUsersView />
    </>
  );
}
