// Create a 'lazy loading image' component to identify images as non-blocking (non-critical) and load these only when needed

const LazyImage = ({ src, alt, ...props }) => {
  return <img src={src} alt={alt} loading="lazy" {...props} />;
};

export default LazyImage;
