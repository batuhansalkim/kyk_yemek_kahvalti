// import React, { useState, useEffect } from "react";
// import { useSwipeable } from "react-swipeable";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Coffee,
//   Utensils,
//   Sun,
//   Moon,
// } from "lucide-react";
// import "./MobileMealPlanner.css";

// //DayComponent Bileşeni
// const DayComponent = ({ data, animationClass }) => (
//   <div className={`day-component ${animationClass}`}>
//     <h2 className="day-title">
//       {data.gun}, {data.tarih}
//     </h2>
//     <div className="meal-section">
//       <h3 className="meal-title breakfast">
//         <Coffee className="meal-icon" /> Kahvaltı
//       </h3>
//       <p className="meal-text">{data.kahvalti.ana_urun}</p>
//       <p className="meal-text">{data.kahvalti.ana_urun2}</p>
//       {/* Burada join ile diziyi birleştiriyoruz. Eğer kahvaltilik undefined olursa hata vermemesi için kontrol ekledim. */}
//       <p className="meal-text">
//         {Array.isArray(data.kahvalti.kahvaltilik)
//           ? data.kahvalti.kahvaltilik.join(", ")
//           : ""}
//       </p>
//       <p className="drink-text">{data.kahvalti.icecek}</p>
//       <p className="meal-text">
//         {data.kahvalti.ekmek}, {data.kahvalti.su}
//       </p>
//     </div>
//     <div className="meal-section">
//       <h3 className="meal-title dinner">
//         <Utensils className="meal-icon" />
//         Akşam Yemeği
//       </h3>
//       <p className="meal-text">{data.ogle_aksam.corba}</p>
//       <p className="meal-text">{data.ogle_aksam.ana_yemek}</p>
//       <p className="meal-text">{data.ogle_aksam.yardimci_yemek}</p>
//       <p className="meal-text">{data.ogle_aksam.ek}</p>
//       <p className="meal-text">
//         {data.ogle_aksam.ekmek}, {data.ogle_aksam.su}
//       </p>
//     </div>
//   </div>
// );

// export default function MobileMealPlanner() {
//   const [mealPlan, setMealPlan] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [startIndex, setStartIndex] = useState(0);
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     return (
//       localStorage.getItem("theme") === "dark" ||
//       localStorage.getItem("theme") === null
//     );
//   });
//   const [animationClass, setAnimationClass] = useState("");
//   const [alertMessage, setAlertMessage] = useState("");

//   // Tema güncellemesi için useEffect
//   useEffect(() => {
//     document.documentElement.setAttribute(
//       "data-theme",
//       isDarkMode ? "dark" : "light"
//     );
//     localStorage.setItem("theme", isDarkMode ? "dark" : "light");
//   }, [isDarkMode]);

//   // Verileri çekmek için useEffect
//   useEffect(() => {
//     fetch("/kasimveriler.json")
//       .then((response) => response.json())
//       .then((data) => {
//         setMealPlan(data.kasim_2024);

//         const today = new Date();
//         const todayString = today.toLocaleDateString("tr-TR", {
//           day: "2-digit",
//           month: "2-digit",
//           year: "numeric",
//         });

//         const todayIndex = data.kasim_2024.findIndex(
//           (day) => day.tarih === todayString
//         );

//         const initialIndex = todayIndex >= 0 ? todayIndex : 0;
//         setCurrentIndex(initialIndex);
//         setStartIndex(initialIndex);
//       })
//       .catch((error) => console.error("Error fetching meal plan:", error));
//   }, []);

//   // Gezinme fonksiyonu
//   const handleNavigation = (direction) => {
//     setAnimationClass(
//       direction === "next" ? "slide-out-left" : "slide-out-right"
//     );
//     setTimeout(() => {
//       setCurrentIndex((prev) => {
//         const newIndex = direction === "next" ? prev + 1 : prev - 1;

//         const maxForward = Math.min(startIndex + 5, mealPlan.length - 1);
//         const maxBackward = Math.max(startIndex - 5, 0);

//         if (newIndex > maxForward) {
//           setAlertMessage("En fazla 5 gün sonraki yemeği görebilirsiniz.");
//           return prev;
//         } else if (newIndex < maxBackward) {
//           setAlertMessage("En fazla 5 gün önceki yemeği görebilirsiniz.");
//           return prev;
//         }

//         setAlertMessage("");
//         return newIndex;
//       });
//       setAnimationClass(
//         direction === "next" ? "slide-in-right" : "slide-in-left"
//       );
//     }, 300);
//   };

//   const handlers = useSwipeable({
//     onSwipedLeft: () => handleNavigation("next"),
//     onSwipedRight: () => handleNavigation("prev"),
//     preventDefaultTouchmoveEvent: true,
//     trackMouse: true,
//   });

//   return (
//     <div className="meal-planner">
//       <div className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
//         {isDarkMode ? (
//           <Sun className="theme-toggle-icon" />
//         ) : (
//           <Moon className="theme-toggle-icon" />
//         )}
//       </div>

//       <div className="planner-container" {...handlers}>
//         {mealPlan.length > 0 && (
//           <DayComponent
//             data={mealPlan[currentIndex]}
//             animationClass={animationClass}
//           />
//         )}
//       </div>

//       {alertMessage && (
//         <div className="alert-message">
//           <p>{alertMessage}</p>
//         </div>
//       )}

//       <div className="navigation-buttons">
//         <button
//           className="nav-button"
//           onClick={() => handleNavigation("prev")}
//           disabled={currentIndex <= Math.max(startIndex - 5, 0)}
//         >
//           <ChevronLeft className="button-icon" />
//           Önceki
//         </button>
//         <button
//           className="nav-button"
//           onClick={() => handleNavigation("next")}
//           disabled={
//             currentIndex >= Math.min(startIndex + 5, mealPlan.length - 1)
//           }
//         >
//           Sonraki
//           <ChevronRight className="button-icon" />
//         </button>
//       </div>

//       <div className="developer-credit">
//         <p>
//           Developed by{" "}
//           <a target="_blank" href="https://www.linkedin.com/in/batuhanslkmm/">
//             Batuhan Salkım
//           </a>
//           ,{" "}
//           <a target="_blank" href="https://www.linkedin.com/in/ahmetcaliskann/">
//             Ahmet Çalışkan
//           </a>
//         </p>
//       </div>
//     </div>
//   );
// }

import React from "react";

import "./MobileMealPlanner.css";

export default function MobileMealPlanner() {
  return (
    <div className="meal-planner">
      <div className="maintenance-message">
        <h2>Site Bakımda</h2>
        <p>Aralık ayı listesi 2 gün sonra yayınlanacak.</p>
      </div>
    </div>
  );
}
