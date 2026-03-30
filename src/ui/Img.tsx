interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | undefined;
}

const Img = ({ src, alt, ...props }: ImgProps) => {
  
  const optimizeCloudinaryUrl = (url: string | undefined) => {
    if (!url) return ""; 

    let finalUrl = url;

    // Si l'URL commence par '{', c'est du JSON, on l'extrait
    if (url.startsWith('{')) {
      try {
        finalUrl = JSON.parse(url).url;
      } catch (error) {
        console.log("Erreur: ", error)
        finalUrl = url; // En cas d'erreur, on garde la string d'origine
      }
    }

    if (!finalUrl || !finalUrl.includes("res.cloudinary.com")) return finalUrl;

    const optimizationParams = "f_auto,q_auto,w_800";
    return finalUrl.replace("/upload/", `/upload/${optimizationParams}/`);
  };

  return (
    <img 
      src={optimizeCloudinaryUrl(src)} 
      alt={alt || "Nadjitan Portfolio"} 
      loading="lazy"
      {...props} 
    />
  );
};

export default Img;