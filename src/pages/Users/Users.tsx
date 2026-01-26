import UsersList from "./components/UsersList"

function Users() {
    return (
        <>
            <main className=" w-full h-full bg-white rounded-xl overflow-auto">
                <UsersList />
            </main>
        </>
    )
}

export default Users
