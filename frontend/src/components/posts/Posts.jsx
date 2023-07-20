import "./posts.scss";

// Component
import Post from "../post/Post";

export default function Posts() {
  // TODO : Replace by data fetched by API
  const posts = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      userId: 1,
      profilePic:
        "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1600",
      desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Qui ipsum, molestiae necessitatibus enim natus ut quidem eaque dolores illum voluptatum!",
      img: "https://images.pexels.com/photos/3756157/pexels-photo-3756157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    },
    {
      id: 2,
      firstName: "John",
      lastName: "Doe",
      userId: 2,
      profilePic:
        "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1600",
      desc: "Quos consequatur unde nihil nesciunt temporibus sed nam culpa repellendus libero hic asperiores consequuntur ex veritatis commodi officiis velit, facere provident porro dicta amet saepe mollitia dolorum, eveniet voluptatem! Amet unde doloribus nisi at velit eius totam repellat delectus ratione autem debitis necessitatibus, natus, aspernatur accusamus dolor qui tempore molestiae repellendus deleniti ipsum excepturi reiciendis et quidem alias. Nemo suscipit recusandae autem.",
    },
  ];

  return (
    <div className="posts">
      {posts.map((post) => (
        <Post post={post} key={post.id} />
      ))}
    </div>
  );
}
