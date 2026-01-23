import { Route, Routes } from "react-router-dom"
import Dashboard from "../pages/Dashboard/Dashboard"
import Services from "../pages/Services/Services"
import ServiceDetails from "../pages/Services/components/ServiceDetails"
import AddService from "../pages/Services/components/AddService"
import Categories from "../pages/Categories/Categories"
import Projects from "../pages/Projects/Projects"
import DetailsProject from "../pages/Projects/components/DetailsProject"
import ProjectForm from "../pages/Projects/components/ProjectForm"
import Skills from "../pages/Skills/Skills"
import SkillsDetails from "../pages/Skills/components/SkillsDetails"
import SkillsForm from "../pages/Skills/components/SkillsForm"
import Collabs from "../pages/Collabs/Collabs"
import CollabsForm from "../pages/Collabs/components/CollabsForm"
import Languages from "../pages/Languages/Languages"
import LanguageForm from "../pages/Languages/components/LanguageForm"
import Feedbacks from "../pages/Feedbacks/Feedbacks"
import FeedbacksForm from "../pages/Feedbacks/components/FeedbacksForm"
import Review from "../pages/Review/Review"
import ReviewAdd from "../pages/Review/components/ReviewAdd"
import Messages from "../pages/Messages/Messages"
import MessageBox from "../pages/Messages/components/MessageBox"
import Interest from "../pages/Interest/Interest"
import InterestDetails from "../pages/Interest/components/InterestDetails"
import Login from "../pages/Login/Login"
import Chat from "../pages/Chat/Chat"
import ProtectedRoute from "../components/protectRoutes"
import NotFound from "../pages/Notfound/NotFound"

function AppRouter() {
    return (

        <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetails />} />
                <Route path="/add-service" element={<AddService />} />
                <Route path="/update-service/:id" element={<AddService />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/projets" element={<Projects />} />
                <Route path="/projets/:id" element={<DetailsProject />} />
                <Route path="/projets/add" element={<ProjectForm />} />
                <Route path="/projets/update/:id" element={<ProjectForm />} />
                <Route path="/competances" element={<Skills />} />
                <Route path="/competances/:id" element={<SkillsDetails />} />
                <Route path="/competances/add" element={<SkillsForm />} />
                <Route path="/competances/update/:id" element={<SkillsForm />} />
                <Route path="/collabs" element={<Collabs />} />
                <Route path="/collabs/add" element={<CollabsForm />} />
                <Route path="/collabs/update/:id" element={<CollabsForm />} />
                <Route path="/languages" element={<Languages />} />
                <Route path="/languages/add" element={<LanguageForm />} />
                <Route path="/languages/update/:id" element={<LanguageForm />} />
                <Route path="/feedbacks" element={<Feedbacks />} />
                <Route path="/feedbacks/add" element={<FeedbacksForm />} />
                <Route path="/feedbacks/update/:id" element={<FeedbacksForm />} />
                <Route path="/reviews" element={<Review />} />
                <Route path="/reviews/add" element={<ReviewAdd />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/details/:id" element={<MessageBox />} />
                <Route path="/interests" element={<Interest />} />
                <Route path="/interests/details/:id" element={<InterestDetails />} />
                <Route path="/chats" element={<Chat />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>

    )
}

export default AppRouter
