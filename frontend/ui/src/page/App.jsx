import { useRef, useState, useEffect } from "react";
import StudyAssistant from "./StudyAssistant";
import LandingPage from "./LandingPage";

export default function App() {
  const fileRef = useRef(null);
  const [showStudyAssistant, setShowStudyAssistant] = useState(false);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('showStudyAssistant', JSON.stringify(showStudyAssistant));
  }, [showStudyAssistant]);

  const handleProceedFromLanding = () => {
    setShowStudyAssistant(true);
  };

  const handleBackToLanding = () => {
    setShowStudyAssistant(false);
    localStorage.removeItem('showStudyAssistant');
  };

  return (
    <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column" }}>
      <style>{`
        html, body, #root {
          height: 100%;
          width: 100%;
          overflow: hidden;
          background-color: #0f172a;
        }
      `}</style>
      {showStudyAssistant ? (
        <StudyAssistant fileRef={fileRef} onBackToLanding={handleBackToLanding} />
      ) : (
        <LandingPage onProceed={handleProceedFromLanding} />
      )}
    </div>
  );
}
