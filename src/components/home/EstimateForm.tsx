"use client";
import { useState } from "react";

const tabTitles: string[] = ["Home", "Vehicles", "Health", "Life"];

const EstimateForm = () => {
   
   const [activeTab, setActiveTab] = useState<number>(0);
   const [rangeValues, setRangeValues] = useState<number[]>(
      Array(tabTitles.length).fill(400000)
   );

   const handleTabClick = (index: number) => {
      setActiveTab(index);
   };

   const handleRangeChange = (value: number, index: number) => {
      const updated = [...rangeValues];
      updated[index] = value;
      setRangeValues(updated);
   };

   return (
      <div
         className="estimate__tab-wrap"
         data-aos="fade-left"
         data-aos-delay="200"
      >
         <div className="estimate__tab-inner">
            {/* Tabs */}
            <ul className="nav nav-tabs" role="tablist">
               {tabTitles.map((tab, index) => (
                  <li
                     key={index}
                     className="nav-item"
                     role="presentation"
                     onClick={() => handleTabClick(index)}
                  >
                     <button
                        className={`nav-link ${activeTab === index ? "active" : ""}`}
                     >
                        {tab}
                     </button>
                  </li>
               ))}
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
               {tabTitles.map((tab, index) => (
                  <div
                     key={index}
                     className={`tab-pane fade ${activeTab === index ? "show active" : ""
                        }`}
                     role="tabpanel"
                  >
                     <div className="estimate-form-wrap">
                        <form action="#">
                           <div className="form-grp">
                              <input type="text" placeholder="Full Name" />
                           </div>
                           <div className="form-grp">
                              <input type="email" placeholder="E-mail" />
                           </div>
                           <div className="form-grp">
                              <input type="number" placeholder="Phone" />
                           </div>

                           {/* Range Slider */}
                           <div className="range-slider-wrap">
                              <div className="content-top">
                                 <p>Limits of balance:</p>
                                 <span>
                                    $<strong>{rangeValues[index]}</strong>
                                 </span>
                              </div>
                              <input
                                 className="range"
                                 type="range"
                                 value={rangeValues[index]}
                                 min={0}
                                 max={600000}
                                 onChange={(e) =>
                                    handleRangeChange(Number(e.target.value), index)
                                 }
                              />
                           </div>

                           <button className="tg-btn tg-btn-seven" type="submit">
                              Get a Quote Now
                           </button>
                        </form>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

export default EstimateForm;
