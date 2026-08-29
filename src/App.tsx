import { BrowserRouter } from "react-router-dom"
import AppRouter from "./router/AppRouter"

function App() {
  return (
    <BrowserRouter basename="/my-portfolio-dashboard">
      <AppRouter />
    </BrowserRouter>
  )
}

export default App
