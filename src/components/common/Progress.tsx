interface ProgressItem {
   id: number;
   title: string;
   percentage: number;
}

const progressData: ProgressItem[] = [
   { id: 1, title: "Consulting", percentage: 50 },
   { id: 2, title: "Investment", percentage: 76 },
   { id: 3, title: "Project Completed Rate", percentage: 90 },
];

interface ProgressProps {
   isVisible: boolean;
   p_class?: string;
}

const Progress: React.FC<ProgressProps> = ({ isVisible, p_class }) => {
   return (
      <>
         {progressData.map((item) => (
            <div className={`progress__item ${p_class ?? ""}`} key={item.id}>
               <h6 className="title">{item.title}</h6>
               <div
                  className="progress"
                  role="progressbar"
                  aria-label={`${item.title} progress`}
                  aria-valuenow={item.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
               >
                  <div
                     className="progress-bar"
                     style={{
                        width: isVisible ? `${item.percentage}%` : "0%",
                        transition: "width 1.5s ease-in-out",
                     }}
                  >
                     <span>{item.percentage}%</span>
                  </div>
               </div>
            </div>
         ))}
      </>
   );
};

export default Progress;
