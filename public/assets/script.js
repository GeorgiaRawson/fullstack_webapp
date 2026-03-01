let token = localStorage.getItem("authToken");

function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  fetch("http://localhost:3001/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        alert("User registered successfully");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  fetch("http://localhost:3001/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      // Save the token in the local storage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("username", data.username);
        token = data.token;

        alert("User Logged In successfully");

        // Fetch the posts list
        fetchPosts();

        // Hide the auth container and show the app container as we're now logged in
        document.getElementById("auth-container").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");
        document.getElementById("user-container").classList.remove("hidden");
        document.body.classList.add('logged-in');
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function logout() {
  fetch("http://localhost:3001/api/users/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).then(() => {
    // Clear the token from the local storage as we're now logged out
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    token = null;
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("app-container").classList.add("hidden");
  });
}

function fetchPosts() {
  fetch("http://localhost:3001/api/posts", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((posts) => {
      const postsContainer = document.getElementById("posts");
      postsContainer.innerHTML = "";
      posts.forEach((post) => {
        const div = document.createElement("div");
        div.className = "post-card";
        div.id = `post-container-${post.id}`; // Add an ID to the container for easy targeting
  
        div.innerHTML = `
          <h3 id="title-${post.id}">${post.title}</h3>
          <p id="content-${post.id}">${post.content}</p>
          <div class="post-meta">
            <small>By: ${post.postedBy}</small>
          </div>
          <button class="edit-btn" onclick="editPost(${post.id})">Edit</button>
          <button class="delete-btn" onclick="deletePost(${post.id})">Delete</button>
         `;
        postsContainer.appendChild(div);
      });
    });
}

function createPost() {
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;
  if (!title || !content) {
    alert("Please enter both a title and content.");
    return;
  }
  fetch("http://localhost:3001/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post created successfully");
      document.getElementById("post-title").value = "";
      document.getElementById("post-content").value = "";
      fetchPosts();
    });
}

function deletePost(postId) {
  if (!confirm("Are you sure you want to delete this post?")) return;

  fetch(`http://localhost:3001/api/posts/${postId}`, {
    method: "DELETE",
    headers: { 
        Authorization: `Bearer ${token}` 
    },
  })
    .then((res) => {
      if (res.ok) {
        alert("Post deleted successfully");
        fetchPosts(); 
      } else {
        alert("Failed to delete post. Check permissions.");
      }
    })
    .catch((error) => console.log("Delete error:", error));
}

function editPost(id) {
  const currentTitle = document.getElementById(`title-${id}`).innerText;
  const currentContent = document.getElementById(`content-${id}`).innerText;

  const newTitle = prompt("Edit Title:", currentTitle);
  const newContent = prompt("Edit Content:", currentContent);

  if (newTitle && newContent) {
    fetch(`http://localhost:3001/api/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTitle, content: newContent }),
    })
      .then((res) => {
        if (res.ok) {
          alert("Post updated successfully");
          fetchPosts();
        }
      })
      .catch((err) => console.log("Edit error:", err));
  }
}