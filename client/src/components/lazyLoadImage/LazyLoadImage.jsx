const LazyLoadImage = ({ src, alt, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      {...props} // Pass other attributes such as 'className', 'style', etc.
    />
  );
};

export default LazyLoadImage;
