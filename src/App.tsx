import { BrowserRouter } from "react-router-dom"
import MainLayout from "./Layout/MainLayout"
import AppRouter from "./router/AppRouter"

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <AppRouter />
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
