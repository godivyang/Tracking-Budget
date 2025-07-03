import './BusyIndicator.css';

const BusyIndicator = ({show, message}) => {
  return (
    <>
    {show ?
    <div className="BusyIndicator-Container">
        <div className="Content">
          <div style={{display: "flex"}}>
          {
            "ultimate utility".split("").map((ch, i) => {
              return (
                <div className="Word" key={`busyIndicator_${i}`} style={{animationDelay: (i * 1 / 16)+"s"}}>
                  {ch}
                </div>
              )
            })
          }
          </div>
          {message || "Loading please wait..."}
        </div>
    </div> 
    : undefined}
    </>
  );
}

export default BusyIndicator;