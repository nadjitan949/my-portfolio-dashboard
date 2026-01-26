import type { ReactNode } from "react"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"

type MainLayoutProps = {
    children: ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
    return (
        <>
            <div className="h-screen hidden lg:flex flex-col">
                <div className="shrink-0 p-5 pb-0 bg-gray-100">
                    <Header />
                </div>
                <div className="flex flex-1 p-5 bg-gray-100 overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 ml-5 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>

            <div className=" h-screen w-full flex items-center justify-center lg:hidden px-10">
                <h1 className="text-4xl font-bold text-center text-gray-500"> Veullez vous connecter avec votre ordinateur ! </h1>
            </div>
        </>
    )
}

export default MainLayout
