const line_data: string[] = ["", "", "", "", ""];

const Line = () => {
   return (
      <>
         {line_data.map((line,i) => (
            <div key={i} className="line__item">
               <span></span>
            </div>
         ))}
      </>
   )
}

export default Line
