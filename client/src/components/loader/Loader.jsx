import "./loader.scss";

const Loader = (
  width = "40px",
  height = "40px",
  border = "4px solid rgba(0, 0, 0, 0.1)",
  borderLeftColor = "#333"
) => {
  return (
    <div
      className="loader-container"
      style={{ width: `${width}`, height: `${height}` }}
    >
      <div
        className="loader"
        style={{ border: `${border}`, borderLeftColor: `${borderLeftColor}` }}
      ></div>
    </div>
  );
};

export default Loader;
