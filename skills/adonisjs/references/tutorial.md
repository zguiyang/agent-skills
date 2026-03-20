# Adonisjs - Tutorial

**Pages:** 13

---

## Forms and validation (FullStack tutorial) - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/react/forms-and-validation

**Contents:**
- Add post creation form
- Validate input with VineJS
- Create comments with validation
- Protect write routes with auth middleware

This chapter explains form handling end-to-end for the React tutorial stack: render form pages, submit with Inertia `Form`, validate in controllers via `request.validateUsing`, and persist records.

It recommends dedicated validators created via Ace commands and clear separation of responsibilities between posts and comments controllers.

It also highlights route ordering constraints for dynamic params and the standard pattern of returning validation errors back to the same form view.

---

## Styling and cleanup - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/react/styling-and-cleanup

**Contents:**
- Styling and Cleanup
- Styling the application
- Updating the homepage
- Adding a post creation link
- Adding navigation to the post creation page
- Adding navigation to the post detail page
- What you built

In the previous chapter, we added forms to create posts and comments. We're not done building DevShow yet — there are more features to add — but we've built enough that it's worth pausing to improve the design and user experience.

Right now, users can't easily navigate between pages, and the design looks bare. Let's fix both by adding proper navigation links and styling everything with CSS.

Let's start by adding CSS to make DevShow look polished. The Inertia starter kit already includes a CSS file with some base styles. We'll add DevShow-specific styles to enhance the posts, comments, and overall layout.

Open your CSS file and add the following styles at the end.

These styles use CSS variables like var(--gray-4) and var(--gray-6) that are already defined in the starter kit's base styles. They provide consistent spacing, typography, and color throughout DevShow.

Refresh your browser and visit /posts. You should immediately see improved styling with better spacing, cleaner borders, and more readable typography.

Right now, the homepage doesn't tell users what DevShow is or how to get started. Let's replace it with a proper landing page that explains the site and links to the posts listing.

Open the home page component and replace its content:

We're using the Link component from @adonisjs/inertia/react with the route prop to reference the named route. The className="button" applies styling from the starter kit's CSS.

Visit the homepage at / and you'll see the new landing page with a clear call-to-action button that takes users to the posts listing.

Users who want to share their projects need an easy way to reach the creation form. Let's add a prominent button at the top of the posts listing.

Update your posts index component to add the button in the header.

The posts-list-title class uses flexbox (from the CSS we added earlier) to position the heading and button on opposite sides of the header.

Visit /posts and you'll see the new "Create new post" button in the top-right corner, making it easy for users to share their projects.

When users are on the post creation form, they might want to go back to browsing posts. Let's add a back link at the top of the page.

Update your posts create component:

Visit /posts/create and you'll see the back link above the heading, making navigation intuitive.

Finally, let's add a back link on individual post pages so users can easily return to the full listing.

Update your posts show component:

Now visit any post detail page (click on a post from /posts) and you'll see the back link, completing the navigation flow throughout DevShow.

You've transformed DevShow's user experience with styling and navigation. Here's what you accomplished:

**Examples:**

Example 1 (css):
```css
/* Dev-show styles */
.container {
  max-width: 980px;
  margin: auto;
  padding: 40px 0;
}
.container h1 {
  font-size: 32px;
  letter-spacing: -0.5px;
  margin-bottom: 5px;
}

.post-item {
  padding: 18px 0;
  min-width: 680px;
  border-bottom: 1px solid var(--gray-4);
}

.post-meta {
  display: flex;
  align-items: center;
  margin-top: 8px;
  color: var(--gray-6);
  font-size: 14px;
  font-weight: 500;
  gap: 15px;
}

.post-meta a {
  text-decoration: underline;
}
.post-meta a:hover {
  color: var(--gray-12);
}

.post-item h2 {
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-subtext {
  font-size: 16px;
  line-height: 1;
}

.post-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 40px;
  padding: 5px 0;
  align-items: center;
  border-bottom: 1px solid var(--gray-4);
}
.post-actions button {
  padding: 0;
  background: none;
  cursor: pointer;
}

.post {
  min-width: 680px;
  max-width: 800px;
  margin: auto;
}

.post-summary {
  padding: 15px 0;
  border-bottom: 1px solid var(--gray-4);
}

.post-comment-form {
  padding-bottom: 15px;
  margin: 10px 0 40px 0;
  border-bottom: 1px solid var(--gray-4);
}

.post-comment-form textarea {
  width: 100%;
}

.comment-item {
  padding: 18px 0;
  border-bottom: 1px solid var(--gray-4);
}

.comment-actions {
  display: flex;
}
.comment-actions button {
  padding: 0;
  background: none;
  cursor: pointer;
}

.comment-meta {
  color: var(--gray-6);
  font-size: 14px;
  font-weight: 500;
  margin-top: 5px;
}

.posts-list-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
```

Example 2 (jsx):
```jsx
import { Link } from '@adonisjs/inertia/react'

export default function Home() {
  return (
    <div className="hero">
      <h1>DevShow - Share what you have built</h1>
      <p>
        A small community showcase website to share your creations. Be it a project, tool,
        experiment, or anything they're proud of.
      </p>
      <div>
        <Link route="posts.index" className="button">
          Browse posts created by others
        </Link>
      </div>
    </div>
  )
}
```

Example 3 (jsx):
```jsx
import { InertiaProps } from '~/types'
import { Data } from '@generated/data'
import { Link } from '@adonisjs/inertia/react'

type PageProps = InertiaProps<{
  posts: Data.Post[]
}>

export default function PostsIndex(props: PageProps) {
  const { posts } = props

  return (
    <div className="container">
      <div className="posts-list-title">
        <h1>Posts</h1>
        <Link route="posts.create" className="button">Create new post</Link>
      </div>

      {posts.map((post) => (
        <div key={post.id} className="post-item">
          <h2>{post.title}</h2>

          <div className="post-meta">
            <div>By {post.author.fullName}</div>

            <span>.</span>
            <div>
              <a href={post.url} target="_blank" rel="noreferrer">
                {post.url}
              </a>
            </div>

            <span>.</span>
            <div>
              <Link route="posts.show" routeParams={{ id: post.id }}>
                View comments
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

Example 4 (jsx):
```jsx
import { Form } from '@adonisjs/inertia/react'
import { Link } from '@adonisjs/inertia/react'

export default function PostsCreate() {
  return (
    <div className="form-container">
      <div>
        <Link route="posts.index">
          &lsaquo; Go back to posts listing
        </Link>
        <h1>Share your creation</h1>
        <p>Share the URL and a short summary of your creation</p>
      </div>

      <div>
        <Form route="posts.store">
          {({ errors }) => (
            <>
              {/* ... rest of the form ... */}
            </>
          )}
        </Form>
      </div>
    </div>
  )
}
```

---

## Overview - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/hypermedia/overview

**Contents:**
- Building DevShow - A Community showcase website
- Overview
- Understanding the starter kit
  - How controllers work
  - How views work
- Try creating an account

In this tutorial, you will build DevShow. DevShow is a small community showcase website where users can share what they've built. Every user can create an account, publish a "showcase entry" (a project, tool, experiment, or anything they're proud of), and browse entries created by others.

We're taking a hands-on approach in this tutorial by building a real application from start to finish. Instead of learning about features in isolation, you will see how everything in AdonisJS works together: routing, controllers, models, validation, authentication, and templating all coming together to create a functioning web application.

By the end of this tutorial, you'll have built:

The authentication system (signup, login, logout) is already included in your starter kit and fully functional.

We're starting with the AdonisJS Hypermedia starter kit, which already has authentication built in. Let's see what we have to work with by opening the routes file.

The starter kit gives us user signup, login, and logout routes. Notice how middleware.guest() ensures only logged-out users can access signup/login, while middleware.auth() protects the logout route.

We'll use the auth middleware throughout the tutorial to protect routes that require authentication.

Let's look at the signup controller to see how requests flow through the application.

Each controller method receives an HTTP context object as its first parameter. The context contains everything about the current request: the request data, response object, auth state, view renderer, and more. We destructure just the properties we need (view for rendering templates, request for form data, response for redirects, and auth for authentication).

The create method simply shows the signup form. The store method does the heavy lifting. It validates data, creates the user, logs them in, and redirects home. This pattern of bringing together validators, models, and auth is what you'll see throughout the tutorial.

You might notice the controller references a User model and a signupValidator. The starter kit already includes these. We'll explore how models work in the Database and Models chapter and validators in the Forms and Validation chapter.

When a controller calls view.render('pages/auth/signup'), AdonisJS looks for a template file and renders it as HTML. Let's see what that signup view looks like.

Views live in the resources/views directory. AdonisJS uses Edge as its templating engine. Edge templates look similar to HTML but with special tags that start with @.

The @layout() tag wraps the page content with a common layout (header, footer, CSS). The @form() and @field.root() tags are components that come with the starter kit. They render standard HTML form elements with built-in features like CSRF protection and validation error display.

When you visit /signup, the route calls the controller's create method, which renders this view, and Edge converts it to HTML that your browser displays.

Before we move forward, start your development server with node ace serve --hmr and try creating an account. Get comfortable with how the starter kit works. We'll be building on this foundation.

**Examples:**

Example 1 (python):
```python
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').render('pages/home').as('home')

/**
 * Signup and login routes - only accessible to guests
 */
router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

/**
 * Logout route - only accessible to authenticated users
 */
router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
```

Example 2 (javascript):
```javascript
import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  async create({ view }: HttpContext) {
    return view.render('pages/auth/signup')
  }

  async store({ request, response, auth }: HttpContext) {
    /**
     * Validate the submitted data
     */
    const payload = await request.validateUsing(signupValidator)
    
    /**
     * Create the new user in the database
     */
    const user = await User.create(payload)

    /**
     * Log them in automatically
     */
    await auth.use('web').login(user)
    
    /**
     * Redirect to home page
     */
    response.redirect().toRoute('home')
  }
}
```

Example 3 (swift):
```swift
@layout()
  <div class="form-container">
    <div>
      <h1> Signup </h1>
      <p>
        Enter your details below to create your account
      </p>
    </div>

    <div>
      @form({ route: 'new_account.store', method: 'POST' })
        <div>
          @field.root({ name: 'fullName' })
            @!field.label({ text: 'Full name' })
            @!input.control()
            @!field.error()
          @end
        </div>

        <div>
          @field.root({ name: 'email' })
            @!field.label({ text: 'Email' })
            @!input.control({ type: 'email', autocomplete: 'email' })
            @!field.error()
          @end
        </div>

        <div>
          @field.root({ name: 'password' })
            @!field.label({ text: 'Password' })
            @!input.control({ type: 'password', autocomplete: 'new-password' })
            @!field.error()
          @end
        </div>

        <div>
          @field.root({ name: 'passwordConfirmation' })
            @!field.label({ text: 'Confirm password' })
            @!input.control({ type: 'password', autocomplete: 'new-password' })
            @!field.error()
          @end
        </div>

        <div>
          @!button({ text: 'Sign up', type: 'submit' })
        </div>
      @end
    </div>
  </div>
@end
```

---

## Routes, controllers and views - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/react/routes-controller-views

**Contents:**
- Routes, controllers and views
- Overview
- Displaying the posts list
    - Creating the transformer
    - Creating the controller
    - Defining the route
    - Creating the React component
- Displaying a single post
    - Implementing the controller method
    - Registering the route

In the previous chapter, we created the Post and Comment models with their database tables and relationships. Now we'll bring those models to life by building pages where users can actually see posts.

This tutorial covers basic routing, controllers, and views. For advanced topics like route groups, middleware, route parameters validation, and custom Inertia components, see the Routing guide, Controllers guide, and Inertia documentation.

Right now, your posts and comments exist only in the database. Let's build two pages: one that lists all posts, and another that shows a single post with its comments.

This is where you'll see the complete flow in action — models handle data, transformers serialize it for the frontend, controllers coordinate logic, and React components display everything to users.

Before we begin, make sure your development server is running.

Let's build the complete feature for displaying a list of posts. We'll create a transformer to serialize post data, add a controller method to fetch posts, register a route, and create the React component.

Transformers convert your Lucid models into plain JSON objects that can be safely sent to your React frontend. They explicitly control what data gets serialized and generate TypeScript types for your components.

Create a transformer for posts:

This creates app/transformers/post_transformer.ts. Open it and define what data to serialize:

We're using this.pick() to select specific fields from the Post model, and transforming the related user with UserTransformer. The starter kit already includes UserTransformer, which serializes user data (id, fullName, email).

Now create a controller to handle post-related requests.

This creates app/controllers/posts_controller.ts. Add a method to list all posts:

A few things to note here:

Open your routes file and register a route.

The route connects the /posts URL to your controller's index method. When someone visits /posts, AdonisJS calls PostsController.index() and Inertia renders the React component with the posts data.

The #generated/controllers import is automatically generated by AdonisJS and provides type-safe references to your controllers. The development server watches for new controllers and regenerates this file automatically — this is why the dev server must be running when you create new controllers. For more details on how this works, see the Controllers guide.

Time to create the React component that will display the posts.

This creates inertia/pages/posts/index.tsx. Open it and add the following code:

Let's break down what's happening:

Visit /posts and you should see a list of all your posts!

Now let's add the ability to view an individual post with its details. We'll implement the controller method, register the route with a dynamic parameter, and create the React component.

Add the show method to your controller:

We're using firstOrFail() which will automatically throw a 404 error if no post exists with that ID. The pattern is the same as index: fetch data, transform it, and pass it as props.

Register the route for this controller method:

The :id part is a route parameter. When someone visits /posts/5, AdonisJS captures that 5 and makes it available in your controller as params.id.

Create the component for displaying a single post:

This creates inertia/pages/posts/show.tsx. Open it and add the following code:

Again, we're using InertiaProps with the generated Data.Post type to get automatic type safety for the post prop.

Try clicking on a post from your list page. You should now see the full post with its title, author, and content.

Right now, clicking between pages causes full page reloads. Inertia provides a Link component that enables client-side navigation — clicking a link fetches only the new page data via AJAX and swaps the component, making your app feel instant.

Let's update the posts list to use the Link component:

The Link component accepts two important props:

You might be wondering where posts.show comes from. When you define a route with a controller, AdonisJS automatically generates a route name based on the controller and method names. For example, [controllers.Posts, 'show'] automatically gets the name posts.show.

This is much better than hardcoding URLs like href={/posts/${post.id}} because:

Now when you click "View comments", Inertia handles the navigation without a full page reload. The browser's back button still works, and the URL updates properly — but it feels much faster.

Finally, let's display the comments for each post. First, we need to create a transformer for comments, update the Post transformer to include them, preload them in the controller, and finally display them in the React component.

Create a transformer for comments:

Open it and define what data to serialize:

Now update PostTransformer to include comments:

We're using this.whenLoaded() to guard against undefined relationships. This means the comments field will only be included if we preloaded the relationship in the controller.

Update the show method to preload comments and their authors:

We're preloading comments along with each comment's user (the author), and ordering them by creation date with oldest first.

Update the component to display the comments:

Notice how TypeScript knows that post.comments exists and what shape each comment has. This is all thanks to the generated Data.Post type from our transformers.

Refresh your post detail page and you'll now see all the comments listed below the post content!

You've just completed the full data flow in an AdonisJS + Inertia app:

**Examples:**

Example 1 (unknown):
```unknown
node ace serve --hmr
```

Example 2 (unknown):
```unknown
node ace make:transformer post
```

Example 3 (lua):
```lua
import { BaseTransformer } from '@adonisjs/core/transformers'
import type Post from '#models/post'
import UserTransformer from '#transformers/user_transformer'

export default class PostTransformer extends BaseTransformer<Post> {
  toObject() {
    return {
      ...this.pick(this.resource, ['id', 'title', 'url', 'summary', 'createdAt']),
      author: UserTransformer.transform(this.resource.user),
    }
  }
}
```

Example 4 (unknown):
```unknown
node ace make:controller posts
```

---

## Styling and cleanup - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/hypermedia/styling-and-cleanup

**Contents:**
- Styling and Cleanup
- Styling the application
- Updating the homepage
- Adding a post creation link
- Adding navigation to the post creation page
- Adding navigation to the post detail page
- What you built

In the previous chapter, we added forms to create posts and comments. We're not done building DevShow yet — there are more features to add — but we've built enough that it's worth pausing to improve the design and user experience.

Right now, users can't easily navigate between pages, and the design looks bare. Let's fix both by adding proper navigation links and styling everything with CSS.

Let's start by adding CSS to make DevShow look polished. The Hypermedia starter kit already includes a CSS file with some base styles. We'll add DevShow-specific styles to enhance the posts, comments, and overall layout.

Open your CSS file and add the following styles at the end.

These styles use CSS variables like var(--gray-4) and var(--gray-6) that are already defined in the starter kit's base styles. They provide consistent spacing, typography, and color throughout DevShow.

Refresh your browser and visit /posts. You should immediately see improved styling with better spacing, cleaner borders, and more readable typography.

Right now, the homepage doesn't tell users what DevShow is or how to get started. Let's replace it with a proper landing page that explains the site and links to the posts listing.

Replace the entire content of your homepage with this:

In Chapter 4, we learned about named routes and used the urlFor() helper to generate URLs in our templates. This time, we use the @!link() component which accepts the route name as the route parameter. The class: 'button' applies styling from the starter kit's CSS.

Visit the homepage at / and you'll see the new landing page with a clear call-to-action button that takes users to the posts listing.

Users who want to share their projects need an easy way to reach the creation form. Let's add a prominent button at the top of the posts listing.

Update your posts index template to add the button in the header.

The posts-list-title class uses flexbox (from the CSS we added earlier) to position the heading and button on opposite sides of the header.

Visit /posts and you'll see the new "Create new post" button in the top-right corner, making it easy for users to share their projects.

When users are on the post creation form, they might want to go back to browsing posts. Let's add a back link at the top of the page.

Update your posts create template.

Visit /posts/create and you'll see the back link above the heading, making navigation intuitive.

Finally, let's add a back link on individual post pages so users can easily return to the full listing.

Update your posts show template.

Now visit any post detail page (click on a post from /posts) and you'll see the back link, completing the navigation flow throughout DevShow.

You've transformed DevShow's user experience with styling and navigation. Here's what you accomplished:

**Examples:**

Example 1 (css):
```css
/* Dev-show styles */
.container {
  max-width: 980px;
  margin: auto;
  padding: 40px 0;
}
.container h1 {
  font-size: 32px;
  letter-spacing: -0.5px;
  margin-bottom: 5px;
}

.post-item {
  padding: 18px 0;
  min-width: 680px;
  border-bottom: 1px solid var(--gray-4);
}

.post-meta {
  display: flex;
  align-items: center;
  margin-top: 8px;
  color: var(--gray-6);
  font-size: 14px;
  font-weight: 500;
  gap: 15px;
}

.post-meta a {
  text-decoration: underline;
}
.post-meta a:hover {
  color: var(--gray-12);
}

.post-item h2 {
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 10px;
}

.post-subtext {
  font-size: 16px;
  line-height: 1;
}

.post-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 40px;
  padding: 5px 0;
  align-items: center;
  border-bottom: 1px solid var(--gray-4);
}
.post-actions button {
  padding: 0;
  background: none;
  cursor: pointer;
}

.post {
  min-width: 680px;
  max-width: 800px;
  margin: auto;
}

.post-summary {
  padding: 15px 0;
  border-bottom: 1px solid var(--gray-4);
}

.post-comment-form {
  padding-bottom: 15px;
  margin: 10px 0 40px 0;
  border-bottom: 1px solid var(--gray-4);
}

.post-comment-form textarea {
  width: 100%;
}

.comment-item {
  padding: 18px 0;
  border-bottom: 1px solid var(--gray-4);
}

.comment-actions {
  display: flex;
}
.comment-actions button {
  padding: 0;
  background: none;
  cursor: pointer;
}

.comment-meta {
  color: var(--gray-6);
  font-size: 14px;
  font-weight: 500;
  margin-top: 5px;
}

.posts-list-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
```

Example 2 (jsx):
```jsx
@layout()
  <div class="hero">
    <h1>DevShow - Share what you have built</h1>
    <p>
      A small community showcase website to share your creations. Be it a project, tool, experiment, or anything they're proud of.
    </p>
    <div>
      @!link({
        text: 'Browse posts created by others',
        route: 'posts.index',
        class: 'button'
      })
    </div>
  </div>
@end
```

Example 3 (lua):
```lua
@layout()
  <div class="container">
    <div class="posts-list-title">
      <h1> Posts </h1>
      @!link({
        text: 'Create new post',
        route: 'posts.create',
        class: 'button'
      })
    </div>

    @each(post in posts)
      {{-- ... Existing code ... --}}
    @end
  </div>
@end
```

Example 4 (lua):
```lua
@layout()
  <div class="form-container">
    <div>
      @!link({
        route: 'posts.index',
        text: '&lsaquo; Go back to posts listing'
      })
      <h1>
        Share your creation
      </h1>
      <p>
        Share the URL and a short summary of your creation
      </p>
    </div>

    <div>
      @form({ route: 'posts.store', method: 'POST' })
        {{-- ... rest of the form ... --}}
      @end
    </div>
  </div>
@end
```

---

## Commandline and REPL - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/hypermedia/cli-and-repl

**Contents:**
- Command line and REPL
- Exploring available commands
- Using the REPL
  - Start the REPL and load models
  - Create users
  - Fetch all users
  - Find and delete a user
  - Exit the REPL

You might be wondering why we're covering CLI and REPL instead of jumping straight into building features. Here's why: throughout this tutorial, you'll constantly use Ace commands to generate controllers, models, and other files. Getting familiar with the CLI now prevents us from interrupting the flow later.

More importantly, the REPL will become our playground for experimenting with models and databases. When we explore database queries, filters, and relationships in later sections, we'll use the REPL to try things out. It's a throwaway environment that lets us focus on learning concepts without the ceremony of building complete features.

Let's start by seeing what commands AdonisJS gives us. Run this in your terminal.

You should see something like this:

Notice how the commands are grouped together?

Want to know more about a specific command? Just add --help to the end. This shows you everything that command can do, including any options you can pass to it.

The REPL will be our experimentation playground throughout the tutorial. Let's explore how to use it by creating and querying users for our DevShow web-app.

First, start the REPL:

Once the REPL starts, load all your models using the loadModels() helper. The REPL provides several built-in helper functions like this to make experimentation easier. This helper will make all your models available under the models namespace.

Let's use the User model (stored within the app/models/user.ts file) to create a couple of users that we can use to log into our app later. The create method accepts the model properties as an object, persists them to the database and returns a model instance.

Let's create another user.

Now that you have created a couple of users, let's fetch them using the all method. This method will execute a SELECT * query and returns an array containing both users. Each user is a User model instance, not a plain JavaScript object.

You can find a user with a given ID using the find method. The return value is an instance of the User model or null (if no user was found).

You can delete this user by simply calling the delete method on the User instance.

If you list all users again, you should see only Jane remains:

When you're done exploring, type .exit or press Ctrl+D to leave the REPL and return to your terminal.

**Examples:**

Example 1 (unknown):
```unknown
node ace list
```

Example 2 (unknown):
```unknown
node ace make:controller --help
```

Example 3 (unknown):
```unknown
node ace repl
```

Example 4 (dart):
```dart
await loadModels()

// Access user model
models.user
```

---

## Overview - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/react/overview

**Contents:**
- Building DevShow - A Community showcase website
- Overview
- Understanding the starter kit
  - How controllers work with Inertia
  - About Inertia and React
  - How the signup form works
- Try creating an account

In this tutorial, you will build DevShow. DevShow is a small community showcase website where users can share what they've built. Every user can create an account, publish a "showcase entry" (a project, tool, experiment, or anything they're proud of), and browse entries created by others.

We're taking a hands-on approach in this tutorial by building a real application from start to finish. Instead of learning about features in isolation, you will see how everything in AdonisJS and React works together: routing, controllers, models, validation, authentication, transformers, and React components all coming together to create a functioning web application.

By the end of this tutorial, you'll have built:

The authentication system (signup, login, logout) is already included in your starter kit and fully functional.

We're starting with the AdonisJS Inertia + React starter kit, which already has authentication built in. Let's see what we have to work with by opening the routes file.

The starter kit gives us user signup, login, and logout routes. Notice how middleware.guest() ensures only logged-out users can access signup/login, while middleware.auth() protects the logout route.

We'll use the auth middleware throughout the tutorial to protect routes that require authentication.

Let's look at the signup controller to see how requests flow through the application with Inertia.

Each controller method receives an HTTP context object as its first parameter. The context contains everything about the current request: the request data, response object, auth state, Inertia renderer, and more. We destructure just the properties we need (inertia for rendering React components, request for form data, response for redirects, and auth for authentication).

The create method renders the signup form using inertia.render(). Instead of returning HTML like traditional server-rendered apps, Inertia sends a JSON response containing the component name and any props. Your React frontend receives this and renders the corresponding component.

The store method does the heavy lifting. It validates data, creates the user, logs them in, and redirects home. This pattern of bringing together validators, models, and auth is what you'll see throughout the tutorial.

You might notice the controller references a User model and a signupValidator. The starter kit already includes these. We'll explore how models work in the Database and Models chapter and validators in the Forms and Validation chapter.

If you've worked with meta-frameworks like Next.js or Remix, this starter kit might look unusual. Most of our code lives in AdonisJS (the backend), and React is only used to render views. There's no frontend routing, no isomorphic code running on both server and client, and no complex state management libraries.

This is intentional. Inertia's philosophy is simple: keep your backend and frontend separate, but make them work together seamlessly.

If you're hearing about Inertia for the first time, you might want to visit inertiajs.com to learn more about its philosophy. Or just power through this tutorial and see for yourself how simple it is compared to the complexity cocktail offered by meta-frameworks.

Here's how a request flows in an AdonisJS + Inertia app:

When a controller calls inertia.render('auth/signup'), Inertia looks for a React component at inertia/pages/auth/signup.tsx and renders it. Let's look at that component.

Page components live in the inertia/pages directory. The Form component from @adonisjs/inertia/react handles form submissions. It accepts a route prop (the named route to submit to) and provides an errors object through a render prop pattern. When you submit the form, Inertia sends the request to your backend and automatically handles the response, including displaying validation errors.

Before we move forward, start your development server with node ace serve --hmr and try creating an account. Get comfortable with how the starter kit works. We'll be building on this foundation.

**Examples:**

Example 1 (python):
```python
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.on('/').renderInertia('home')

/**
 * Signup and login routes - only accessible to guests
 */
router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

/**
 * Logout route - only accessible to authenticated users
 */
router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())
```

Example 2 (javascript):
```javascript
import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup')
  }

  async store({ request, response, auth }: HttpContext) {
    /**
     * Validate the submitted data
     */
    const payload = await request.validateUsing(signupValidator)
    
    /**
     * Create the new user in the database
     */
    const user = await User.create(payload)

    /**
     * Log them in automatically
     */
    await auth.use('web').login(user)
    
    /**
     * Redirect to home page
     */
    response.redirect().toRoute('home')
  }
}
```

Example 3 (unknown):
```unknown
Browser Request
    ↓
AdonisJS Router
    ↓
Controller (validates, queries database, etc.)
    ↓
inertia.render('component-name', props)
    ↓
React Component (rendered via Vite)
    ↓
Browser Response
```

Example 4 (jsx):
```jsx
import { Form } from '@adonisjs/inertia/react'

export default function Signup() {
  return (
    <div className="form-container">
      <div>
        <h1>Signup</h1>
        <p>Enter your details below to create your account</p>
      </div>

      <div>
        <Form route="new_account.store">
          {({ errors }) => (
            <>
              <div>
                <label htmlFor="fullName">Full name</label>
                <input
                  type="text"
                  name="fullName"
                  id="fullName"
                  data-invalid={errors.fullName ? 'true' : undefined}
                />
                {errors.fullName && <div>{errors.fullName}</div>}
              </div>

              <div>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  data-invalid={errors.email ? 'true' : undefined}
                />
                {errors.email && <div>{errors.email}</div>}
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  data-invalid={errors.password ? 'true' : undefined}
                />
                {errors.password && <div>{errors.password}</div>}
              </div>

              <div>
                <label htmlFor="passwordConfirmation">Confirm password</label>
                <input
                  type="password"
                  name="passwordConfirmation"
                  id="passwordConfirmation"
                  autoComplete="new-password"
                  data-invalid={errors.passwordConfirmation ? 'true' : undefined}
                />
                {errors.passwordConfirmation && <div>{errors.passwordConfirmation}</div>}
              </div>

              <div>
                <button type="submit" className="button">
                  Sign up
                </button>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  )
}
```

---

## Database and models - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/hypermedia/database-and-models

**Contents:**
- Database and Models
- Overview
- Creating the Post model
    - Generate the model and migration
    - Understanding the generated model
    - Define the table structure in the migration
- Creating the Comment model
    - Generate the model and migration
    - Define the table structure in the migration
- Running migrations

In this chapter, you will create models and migrations for the Post and Comment resources, establish relationships between them, generate dummy data using factories and seeders, and query your data using the REPL.

This chapter introduces Lucid, AdonisJS's SQL ORM. Instead of writing raw SQL queries, you'll work with JavaScript classes called models that represent your database tables. Throughout this chapter and the rest of the tutorial, you'll interact with your database exclusively through models.

An important distinction: models define how you interact with data, but they don't modify the database structure. That's the job of migrations, which create and alter tables. You'll use both as you build DevShow's database structure.

A note on learning: This chapter introduces several database concepts at once. Don't worry if you don't fully understand everything - the goal is to learn by doing and get something working. Deeper understanding will come with practice.

Our app needs posts, so let's create a Post model and its corresponding database migration. In AdonisJS, you create one model per database table. Lucid uses naming conventions to automatically connect models to their tables - a Post model maps to a posts table, a User model maps to a users table, and so on.

Run this command to create both files at once.

The -m flag tells Ace to create a migration file alongside the model. You'll see this output.

Let's look at what was generated in the model file.

The model extends PostSchema — a class that is auto-generated from your database migrations. You don't need to define columns in your model file. When you run migrations, AdonisJS scans your database tables and generates the database/schema.ts file with all column definitions, types, and decorators. Your model file is where you add relationships and business logic.

Let's update the migration file to define the database table structure. This is where you add columns — the model will pick them up automatically after running the migration.

A few important things about migrations:

Let's create the Comment model following the same process we used for posts.

You'll see output showing the created files.

Update the migration to create the comments table with a content column.

Now let's create these tables in your database by running the migrations.

You'll see output showing which migrations were executed.

Your database now has posts and comments tables! You'll also notice that database/schema.ts has been updated with PostSchema and CommentSchema classes containing all the column definitions. This file is auto-generated every time you run migrations — you never need to edit it manually.

Migrations are tracked in a special adonis_schema table in your database. Once a migration runs successfully, it won't run again even if you execute node ace migration:run multiple times.

Right now our posts and comments exist independently, but in our DevShow web-app, comments belong to posts and posts belong to users. We need to establish these connections in our database and models.

To create these relationships, we need foreign key columns in our tables. A foreign key is a column that references the primary key of another table. For example, a post_id column in the comments table will reference the id column in the posts table, linking each comment to its post.

Since our tables already exist, we'll create a new migration to add these foreign key columns.

The following command will create a new migration file that will modify our existing tables.

Update the migration file to add the foreign key columns.

A few things to understand about this migration:

Now that the database has the foreign key columns, let's update our models to define these relationships.

Remember, column definitions like title, url, summary, and userId are already handled by PostSchema (auto-generated from your migrations). The model file is where you add relationships and business logic.

The @hasMany decorator defines a one-to-many relationship - one post has many comments. The @belongsTo decorator defines the inverse - a post belongs to one user.

Perfect! Our models now understand their relationships. When you load a post, you can easily access its comments through post.comments, and when you load a comment, you can access its post through comment.post or its user through comment.user.

We haven't added the inverse hasMany relationships on the User model (e.g., user.posts or user.comments) because we don't need them in this tutorial. You could add them later if your application needs to query posts or comments from the user side.

Now that our models and database tables are ready, we need to populate them with dummy data for development and testing. Factories act as blueprints for creating model instances filled with realistic fake data. You define the blueprint once, then generate as many instances as you need with a single line of code.

AdonisJS factories use a library called Faker to generate realistic data like names, URLs, paragraphs of text, and more. This makes your dummy data look authentic rather than obvious test placeholders.

This creates a factory file where we'll define how to generate dummy Post data.

Open the factory file and configure what data to generate for each Post.

Now let's create a factory for comments using the same process.

Open the Comment factory and add the data generation logic.

The Comment factory is simpler. It only needs to generate the content field using faker.lorem.paragraph(), which creates a single paragraph of text. We'll handle the userId and postId relationships in the seeder.

Factories define HOW to create fake data, but they don't actually create it automatically. That's where seeders come in - they're scripts that use factories to populate your database with actual data. Every time you reset your database or a teammate clones the project, running node ace db:seed populates the database with consistent, realistic data.

Let's create a seeder that will generate posts and comments.

Now open the seeder file and add the logic to create posts with comments.

Let's break down what this seeder does:

First, we fetch the user with email jane@example.com. This is the user we created in the previous chapter when exploring the CLI and REPL. If you followed along, this user should exist in your database. The findByOrFail method will throw an error if the user doesn't exist.

Next, we use PostFactory.merge({ userId: user.id }).createMany(10) to create 10 posts. The merge() method is important here - it merges additional data with the factory's generated values. We need this to set the userId foreign key on each post. Without it, the foreign key constraint would fail because userId would be undefined.

Then, for each post, we create between 3 to 5 comments using a similar approach. The formula Math.floor(Math.random() * 3) + 3 generates a random number between 3 and 5.

Now execute the seeder to populate your database.

Your database now has 10 posts, each with several comments!

Before we move on to querying data, let's take a moment to understand what we've built. AdonisJS provides dedicated tools for working with databases, and each one has a specific purpose.

Migrations define your database structure. They create tables, add columns, and establish constraints. Think of them as instructions that transform your database schema. When you run node ace migration:run, these instructions execute and modify your database structure. They also auto-generate the database/schema.ts file with column definitions for your models.

Models are your JavaScript interface to database tables. They extend auto-generated schema classes (like PostSchema) that contain column definitions, so you only need to add relationships and business logic. Models provide a clean, type-safe API for querying and manipulating data without writing raw SQL.

Factories generate realistic dummy data for your models. Instead of manually creating test data over and over, you define a blueprint once, and the factory creates as many realistic instances as you need. This is invaluable during development and testing.

Seeders are scripts that populate your database with data. They typically use factories to generate data, but can also create specific records or import data from other sources. Running node ace db:seed executes all your seeders and gives you a consistent database state.

These tools work together: migrations shape the database, models interact with it, factories generate data, and seeders populate it. Each tool is focused on its specific job, making your database workflow organized and maintainable.

Now that we have data in our database, let's explore it using AdonisJS's REPL (Read-Eval-Print Loop). The REPL is an interactive shell where you can run JavaScript code and interact with your models in real-time.

First, start the REPL.

Once the REPL starts, load all your models.

This makes all your models available under the models object.

Let's fetch all posts from the database.

You'll see an array of all 10 posts with their data.

Each post is a Post model instance, not a plain JavaScript object.

Let's search for posts containing "Task Management" in the title using the query() method.

The query() method returns a chainable query builder built on top of Knex, giving you powerful SQL query capabilities while staying in JavaScript. You'll see an array of matching posts, which might be just one or zero depending on what the factory generated.

Now let's demonstrate how to work with relationships. First, fetch a specific post by its ID.

The post is loaded, but its comments aren't loaded yet (relationships are lazy-loaded by default). Use the load method to load the comments relationship.

Now you can access the comments.

You'll see all the comments that belong to this post.

You can also load relationships when initially fetching the post.

This fetches the first post and its comments in a single operation. The preload method is more efficient than loading relationships separately because it avoids the N+1 query problem. Instead of making one query for the post and then one query per comment, it makes just two queries total.

When you're done exploring, type .exit to leave the REPL and return to your terminal.

**Examples:**

Example 1 (unknown):
```unknown
node ace make:model Post -m
```

Example 2 (yaml):
```yaml
DONE:    create app/models/post.ts
DONE:    create database/migrations/1763866156451_create_posts_table.ts
```

Example 3 (gdscript):
```gdscript
import { PostSchema } from '#database/schema'

export default class Post extends PostSchema {
}
```

Example 4 (scala):
```scala
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.string('url').notNullable()
      table.text('summary').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

---

## Commandline and REPL - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/react/cli-and-repl

**Contents:**
- Command line and REPL
- Exploring available commands
- Using the REPL
  - Start the REPL and load models
  - Create users
  - Fetch all users
  - Find and delete a user
  - Exit the REPL

You might be wondering why we're covering CLI and REPL instead of jumping straight into building features. Here's why: throughout this tutorial, you'll constantly use Ace commands to generate controllers, models, and other files. Getting familiar with the CLI now prevents us from interrupting the flow later.

More importantly, the REPL will become our playground for experimenting with models and databases. When we explore database queries, filters, and relationships in later sections, we'll use the REPL to try things out. It's a throwaway environment that lets us focus on learning concepts without the ceremony of building complete features.

Let's start by seeing what commands AdonisJS gives us. Run this in your terminal.

You should see something like this:

Notice how the commands are grouped together?

Want to know more about a specific command? Just add --help to the end. This shows you everything that command can do, including any options you can pass to it.

The REPL will be our experimentation playground throughout the tutorial. Let's explore how to use it by creating and querying users for our DevShow web-app.

First, start the REPL:

Once the REPL starts, load all your models using the loadModels() helper. The REPL provides several built-in helper functions like this to make experimentation easier. This helper will make all your models available under the models namespace.

Let's use the User model (stored within the app/models/user.ts file) to create a couple of users that we can use to log into our app later. The create method accepts the model properties as an object, persists them to the database and returns a model instance.

Let's create another user.

Now that you have created a couple of users, let's fetch them using the all method. This method will execute a SELECT * query and returns an array containing both users. Each user is a User model instance, not a plain JavaScript object.

You can find a user with a given ID using the find method. The return value is an instance of the User model or null (if no user was found).

You can delete this user by simply calling the delete method on the User instance.

If you list all users again, you should see only Jane remains:

When you're done exploring, type .exit or press Ctrl+D to leave the REPL and return to your terminal.

**Examples:**

Example 1 (unknown):
```unknown
node ace list
```

Example 2 (unknown):
```unknown
node ace make:controller --help
```

Example 3 (unknown):
```unknown
node ace repl
```

Example 4 (dart):
```dart
await loadModels()

// Access user model
models.user
```

---

## Routes, controllers and views - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/hypermedia/routes-controller-views

**Contents:**
- Routes, controllers and views
- Overview
- Displaying the posts list
    - Creating the controller
    - Defining the route
    - Creating the view template
- Displaying a single post
    - Implementing the controller method
    - Registering the route
    - Creating the view template

In the previous chapter, we created the Post and Comment models with their database tables and relationships. Now we'll bring those models to life by building pages where users can actually see posts.

This tutorial covers basic routing, controllers, and views. For advanced topics like route groups, middleware, named routes, route parameters validation, and Edge template components, see the Routing guide, Controllers guide, and Edge documentation.

Right now, your posts and comments exist only in the database. Let's build two pages: one that lists all posts, and another that shows a single post with its comments.

This is where you'll see the complete MVC (Model-View-Controller) pattern in action — models handle data, controllers coordinate logic, and views display everything to users.

Before we begin, make sure your development server is running.

Let's build the complete feature for displaying a list of posts. We'll create a controller, add a method to fetch posts, register a route, and create the view template.

Start by creating a controller to handle posts-related requests. Run this command.

This creates a new file at app/controllers/posts_controller.ts. Open it up and you'll see a basic controller class. Let's add a method to list all posts.

A few things to note here:

Open your routes file and register a route.

The route definition connects the /posts URL to your controller's index method. When someone visits /posts, AdonisJS will call PostsController.index() and return whatever that method returns.

The #generated/controllers import is automatically generated by AdonisJS and provides type-safe references to your controllers. The development server watches for new controllers and regenerates this file automatically — this is why the dev server must be running when you create new controllers. For more details on how this works, see the Controllers guide.

Time to create the view template.

This creates a new file at resources/views/posts/index.edge. Open it and add the following code inside it.

This template uses the existing layout component that came with your starter kit. The layout handles the basic HTML structure, and you provide the main content by wrapping it in @layout tag.

Inside, we loop through each post with @each and display its title, the author's name, and a link to view post comments.

Visit /posts and you should see a list of all your posts!

Now let's add the ability to view an individual post with its details. We'll implement the controller method, register the route with a dynamic parameter, and create the view template.

Add the show method to your controller.

We're using firstOrFail() here, which will automatically throw a 404 error if no post exists with that ID. No need to manually check if the post exists—AdonisJS handles that for you.

Now let's register the route for this controller method.

Create the view template for displaying a single post.

This creates resources/views/posts/show.edge. Open it and add the following code.

Try clicking on a post from your list page. You should now see the full post with its title, author, and content.

Right now, we're hardcoding URLs like /posts/{{ post.id }} in our templates. This works, but what happens if we decide to change our URL pattern from /posts/:id to /showcase/:id? We'd have to find and replace every hardcoded URL throughout our application.

This is where named routes come in. Named routes let you assign a unique name to each route, then reference that name when building URLs. If the URL pattern changes, you only update it in one place (the route definition), and all your links automatically work with the new pattern.

When you use a controller in your route definition, AdonisJS automatically generates a route name based on the controller and method names. For example:

You can also manually name routes using the .as() method, which is useful for routes that don't use controllers or when you want a custom name.

Named routes can be referenced across your entire application:

For the complete guide on URL building and named routes, see the URL builder documentation.

Let's update our posts listing page to use named routes.

Finally, let's display the comments for each post. First, we need to preload the comments and their authors in the controller.

We're preloading comments along with each comment's user (the author), and ordering them by creation date with oldest first. Now update the view to display them.

Refresh your post detail page and you'll now see all the comments listed below the post content!

You've just completed the full MVC flow in AdonisJS:

**Examples:**

Example 1 (unknown):
```unknown
node ace serve --hmr
```

Example 2 (unknown):
```unknown
node ace make:controller posts
```

Example 3 (javascript):
```javascript
import Post from '#models/post'
import { type HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ view }: HttpContext) {
    const posts = await Post
      .query()
      .preload('user')
      .orderBy('createdAt', 'desc')

    return view.render('posts/index', { posts })
  }
}
```

Example 4 (python):
```python
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.on('/').render('pages/home').as('home')
router.get('/posts', [controllers.Posts, 'index'])
```

---

## Database and models - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/react/database-and-models

**Contents:**
- Database and Models
- Overview
- Creating the Post model
    - Generate the model and migration
    - Understanding the generated model
    - Define the table structure in the migration
- Creating the Comment model
    - Generate the model and migration
    - Define the table structure in the migration
- Running migrations

In this chapter, you will create models and migrations for the Post and Comment resources, establish relationships between them, generate dummy data using factories and seeders, and query your data using the REPL.

This chapter introduces Lucid, AdonisJS's SQL ORM. Instead of writing raw SQL queries, you'll work with JavaScript classes called models that represent your database tables. Throughout this chapter and the rest of the tutorial, you'll interact with your database exclusively through models.

An important distinction: models define how you interact with data, but they don't modify the database structure. That's the job of migrations, which create and alter tables. You'll use both as you build DevShow's database structure.

A note on learning: This chapter introduces several database concepts at once. Don't worry if you don't fully understand everything - the goal is to learn by doing and get something working. Deeper understanding will come with practice.

Our app needs posts, so let's create a Post model and its corresponding database migration. In AdonisJS, you create one model per database table. Lucid uses naming conventions to automatically connect models to their tables - a Post model maps to a posts table, a User model maps to a users table, and so on.

Run this command to create both files at once.

The -m flag tells Ace to create a migration file alongside the model. You'll see this output.

Let's look at what was generated in the model file.

The model extends PostSchema — a class that is auto-generated from your database migrations. You don't need to define columns in your model file. When you run migrations, AdonisJS scans your database tables and generates the database/schema.ts file with all column definitions, types, and decorators. Your model file is where you add relationships and business logic.

Let's update the migration file to define the database table structure. This is where you add columns — the model will pick them up automatically after running the migration.

A few important things about migrations:

Let's create the Comment model following the same process we used for posts.

You'll see output showing the created files.

Update the migration to create the comments table with a content column.

Now let's create these tables in your database by running the migrations.

You'll see output showing which migrations were executed.

Your database now has posts and comments tables! You'll also notice that database/schema.ts has been updated with PostSchema and CommentSchema classes containing all the column definitions. This file is auto-generated every time you run migrations — you never need to edit it manually.

Migrations are tracked in a special adonis_schema table in your database. Once a migration runs successfully, it won't run again even if you execute node ace migration:run multiple times.

Right now our posts and comments exist independently, but in our DevShow web-app, comments belong to posts and posts belong to users. We need to establish these connections in our database and models.

To create these relationships, we need foreign key columns in our tables. A foreign key is a column that references the primary key of another table. For example, a post_id column in the comments table will reference the id column in the posts table, linking each comment to its post.

Since our tables already exist, we'll create a new migration to add these foreign key columns.

The following command will create a new migration file that will modify our existing tables.

Update the migration file to add the foreign key columns.

A few things to understand about this migration:

Now that the database has the foreign key columns, let's update our models to define these relationships.

Remember, column definitions like title, url, summary, and userId are already handled by PostSchema (auto-generated from your migrations). The model file is where you add relationships and business logic.

The @hasMany decorator defines a one-to-many relationship - one post has many comments. The @belongsTo decorator defines the inverse - a post belongs to one user.

Perfect! Our models now understand their relationships. When you load a post, you can easily access its comments through post.comments, and when you load a comment, you can access its post through comment.post or its user through comment.user.

We haven't added the inverse hasMany relationships on the User model (e.g., user.posts or user.comments) because we don't need them in this tutorial. You could add them later if your application needs to query posts or comments from the user side.

Now that our models and database tables are ready, we need to populate them with dummy data for development and testing. Factories act as blueprints for creating model instances filled with realistic fake data. You define the blueprint once, then generate as many instances as you need with a single line of code.

AdonisJS factories use a library called Faker to generate realistic data like names, URLs, paragraphs of text, and more. This makes your dummy data look authentic rather than obvious test placeholders.

This creates a factory file where we'll define how to generate dummy Post data.

Open the factory file and configure what data to generate for each Post.

Now let's create a factory for comments using the same process.

Open the Comment factory and add the data generation logic.

The Comment factory is simpler. It only needs to generate the content field using faker.lorem.paragraph(), which creates a single paragraph of text. We'll handle the userId and postId relationships in the seeder.

Factories define HOW to create fake data, but they don't actually create it automatically. That's where seeders come in - they're scripts that use factories to populate your database with actual data. Every time you reset your database or a teammate clones the project, running node ace db:seed populates the database with consistent, realistic data.

Let's create a seeder that will generate posts and comments.

Now open the seeder file and add the logic to create posts with comments.

Let's break down what this seeder does:

First, we fetch the user with email jane@example.com. This is the user we created in the previous chapter when exploring the CLI and REPL. If you followed along, this user should exist in your database. The findByOrFail method will throw an error if the user doesn't exist.

Next, we use PostFactory.merge({ userId: user.id }).createMany(10) to create 10 posts. The merge() method is important here - it merges additional data with the factory's generated values. We need this to set the userId foreign key on each post. Without it, the foreign key constraint would fail because userId would be undefined.

Then, for each post, we create between 3 to 5 comments using a similar approach. The formula Math.floor(Math.random() * 3) + 3 generates a random number between 3 and 5.

Now execute the seeder to populate your database.

Your database now has 10 posts, each with several comments!

Before we move on to querying data, let's take a moment to understand what we've built. AdonisJS provides dedicated tools for working with databases, and each one has a specific purpose.

Migrations define your database structure. They create tables, add columns, and establish constraints. Think of them as instructions that transform your database schema. When you run node ace migration:run, these instructions execute and modify your database structure. As a bonus, AdonisJS automatically generates the database/schema.ts file with column definitions for your models.

Models are your JavaScript interface to database tables. They extend auto-generated schema classes that provide column definitions, and you add relationships and business logic on top. Models give you a clean, type-safe API for querying and manipulating data without writing raw SQL.

Factories generate realistic dummy data for your models. Instead of manually creating test data over and over, you define a blueprint once, and the factory creates as many realistic instances as you need. This is invaluable during development and testing.

Seeders are scripts that populate your database with data. They typically use factories to generate data, but can also create specific records or import data from other sources. Running node ace db:seed executes all your seeders and gives you a consistent database state.

These tools work together: migrations shape the database, models interact with it, factories generate data, and seeders populate it. Each tool is focused on its specific job, making your database workflow organized and maintainable.

Now that we have data in our database, let's explore it using AdonisJS's REPL (Read-Eval-Print Loop). The REPL is an interactive shell where you can run JavaScript code and interact with your models in real-time.

First, start the REPL.

Once the REPL starts, load all your models.

This makes all your models available under the models object.

Let's fetch all posts from the database.

You'll see an array of all 10 posts with their data.

Each post is a Post model instance, not a plain JavaScript object.

Let's search for posts containing "Task Management" in the title using the query() method.

The query() method returns a chainable query builder built on top of Knex, giving you powerful SQL query capabilities while staying in JavaScript. You'll see an array of matching posts, which might be just one or zero depending on what the factory generated.

Now let's demonstrate how to work with relationships. First, fetch a specific post by its ID.

The post is loaded, but its comments aren't loaded yet (relationships are lazy-loaded by default). Use the load method to load the comments relationship.

Now you can access the comments.

You'll see all the comments that belong to this post.

You can also load relationships when initially fetching the post.

This fetches the first post and its comments in a single operation. The preload method is more efficient than loading relationships separately because it avoids the N+1 query problem. Instead of making one query for the post and then one query per comment, it makes just two queries total.

When you're done exploring, type .exit to leave the REPL and return to your terminal.

**Examples:**

Example 1 (unknown):
```unknown
node ace make:model Post -m
```

Example 2 (yaml):
```yaml
DONE:    create app/models/post.ts
DONE:    create database/migrations/1763866156451_create_posts_table.ts
```

Example 3 (gdscript):
```gdscript
import { PostSchema } from '#database/schema'

export default class Post extends PostSchema {
}
```

Example 4 (scala):
```scala
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.string('url').notNullable()
      table.text('summary').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

---

## Forms and validation - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/hypermedia/forms-and-validation

**Contents:**
- Forms and Validation
- Overview
- Adding post creation
    - Add controller methods
    - Register the routes
    - Create the form template
    - Create a validator
    - Implement the store method
- Adding comments to posts
    - Create the comment validator

In this chapter, you'll first add the ability for authenticated users to create new posts. Then, you'll apply the same pattern to let users leave comments on existing posts. Along the way, you'll be introduced to AdonisJS's validation layer and learn how to organize your code using separate controllers for different resources.

This tutorial covers basic form handling and validation. For advanced topics like custom validation rules, conditional validation, error message customization, and file uploads, see the Validation guide and VineJS documentation.

So far in the DevShow tutorial, you've built an application that displays posts from your database. But what about creating new posts? That's where forms come in.

Handling forms involves three main steps:

AdonisJS provides Edge form components that render standard HTML form elements with automatic CSRF protection, and VineJS for defining validation rules.

Let's start by adding the ability for users to create new posts. We'll need a controller method to display the form, routes to wire everything up, and a template for the form itself.

First, let's add a create method to your PostsController that will render the form for creating a new post. We'll also stub out a store method that we'll implement later to handle the form submission.

Now let's wire up the routes. We need two: one to display the form and another to handle submissions. Both should only be accessible to logged-in users.

The /posts/create route must be defined before the /posts/:id route.

The auth() middleware ensures only logged-in users can access these routes. Unauthenticated visitors will be redirected to the login page.

Create the template for the form using the Ace CLI.

This creates resources/views/posts/create.edge. Open it and add the following form.

These Edge form components are part of the starter kit. They render standard HTML elements with helpful features like automatic CSRF protection (via @form) and validation error display (via @!field.error()).

Before handling form submissions, we need to define validation rules. AdonisJS uses VineJS for validation, a schema-based validation library that lets you define rules for your data.

Create a validator using the Ace CLI.

This creates app/validators/post.ts. Add a createPostValidator to validate post creation.

The vine.create() method creates a pre-compiled validator from a schema. Inside, we define each field with its type and rules.

Now let's implement the store method to validate the data, create the post, and redirect the user.

Now visit /posts/create, fill out the form, and submit it. Your new post should appear on the posts page! Try submitting invalid data (like a short summary or invalid URL) to see the validation errors in action.

Now that you can create posts, let's add the ability for users to leave comments. We'll create a separate controller for comments. Having one controller per resource is the recommended approach in AdonisJS.

Let's start by defining validation rules for comments.

Since comments only have a content field, the validation is simple.

Generate a new controller using the Ace CLI.

This creates app/controllers/comments_controller.ts. Add a store method to handle comment submissions.

We're using params.id to get the post ID from the route parameter and use it to associate the comment with the post via postId. The response.redirect().back() sends the user back to the post page.

Add a route for creating comments, also protected by the auth middleware.

Open your resources/views/posts/show.edge template and add the comment form.

The routeParams: post passes the post object to the route helper, which extracts post.id to generate the correct URL like /posts/1/comments.

Now visit any post page while logged in and try leaving a comment. After submitting, you'll be redirected back to see your comment in the list.

You've now added full form handling and validation to your DevShow application. Here's what you accomplished:

**Examples:**

Example 1 (lua):
```lua
import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'

export default class PostsController {
  // ... existing methods (index, show)

  /**
   * Display the form for creating a new post
   */
  async create({ view }: HttpContext) {
    return view.render('posts/create')
  }

  /**
   * Handle the form submission for creating a new post
   */
  async store({}: HttpContext) {
    // We'll implement this later
  }
}
```

Example 2 (python):
```python
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

router.get('/posts', [controllers.Posts, 'index'])

router.get('/posts/create', [controllers.Posts, 'create']).use(middleware.auth())
router.post('/posts', [controllers.Posts, 'store']).use(middleware.auth())

router.get('/posts/:id', [controllers.Posts, 'show'])
```

Example 3 (unknown):
```unknown
node ace make:view posts/create
```

Example 4 (swift):
```swift
@layout()
  <div class="form-container">
    <div>
      <h1>
        Share your creation
      </h1>
      <p>
        Share the URL and a short summary of your creation
      </p>
    </div>

    <div>
      @form({ route: 'posts.store', method: 'POST' })
        <div>
          @field.root({ name: 'title' })
            @!field.label({ text: 'Post title' })
            @!input.control({ placeholder: 'Title of your creation' })
            @!field.error()
          @end
        </div>
        
        <div>
          @field.root({ name: 'url' })
            @!field.label({ text: 'URL' })
            @!input.control({ type: 'url', placeholder: 'https://example.com/my-creation' })
            @!field.error()
          @end
        </div>
        
        <div>
          @field.root({ name: 'summary' })
            @!field.label({ text: 'Short summary' })
            @!textarea.control({ rows: 4, placeholder: 'Briefly describe what you are sharing' })
            @!field.error()
          @end
        </div>
        
        <div>
          @!button({ text: 'Publish', type: 'submit' })
        </div>
      @end
    </div>
  </div>
@end
```

---

## Authorization - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/hypermedia/authorization

**Contents:**
- Authorization
- Overview
- Installing Bouncer
- Creating the PostPolicy
- Creating the CommentPolicy
- Adding edit functionality
    - Create the update validator
    - Add controller methods
    - Understanding flash messages
    - Register the routes

In the previous chapter, we improved DevShow's navigation and styling. Now let's add the ability for users to edit and delete their own posts and comments. Right now, any logged-in user could modify anyone's content if we added those features. We need to add authorization checks to prevent this.

To handle permissions properly, we'll use AdonisJS's Bouncer package. Bouncer lets you organize authorization logic into policies (classes where each method represents a permission check). For example, a PostPolicy can have an edit method that checks if a user can edit a specific post.

Instead of scattering permission checks throughout your controllers, you define the rules once in a policy and use them everywhere. In this chapter, we'll install Bouncer, create policies for posts and comments, and implement edit and delete features with proper authorization.

Let's install and configure the Bouncer package using the following command.

Running this command will first install the package and then performs the following actions.

You're all set! Now let's create our first policy.

Policies are classes where each method represents a permission check. Let's create a policy for posts.

Open the generated file and add permission checks for editing and deleting posts.

Each policy method receives the currently logged-in user as the first parameter, followed by the resource being checked (in this case, the post). The method returns true if the user is allowed to perform the action, or false if they're not. Here, we're simply checking if the user's ID matches the post's userId.

You might notice that edit and delete have identical logic right now. Even though they're the same, keeping them separate gives you flexibility. Later, you might decide that posts can't be edited after 24 hours, or that admins can delete any post but can't edit them. Having separate methods makes these kinds of changes easier.

Now create a policy for comments.

Add the delete permission check.

Perfect! Now let's put these policies to work.

We'll add a validator for updating posts. Since we already have a validators/post.ts file for creating posts, we'll add the update validator there too. A single validator file can export multiple validators (this keeps related validation logic organized together).

Open your existing post validator file and add the update validator.

We're cloning the createPostValidator schema to reuse the same validation rules. This approach keeps our validation logic DRY (Don't Repeat Yourself). If you need to change a rule later, you only update it in one place. In many applications, you might want different rules for creating vs. updating, but for DevShow, the requirements are the same.

We'll add two controller methods: edit to show the edit form, and update to handle the form submission. Both methods will use Bouncer to check if the current user is allowed to modify the post before performing any action.

The key part here is bouncer.with(PostPolicy).authorize('edit', post). This line:

Notice we check authorization in both methods. Even though edit checks permissions, someone could bypass the form and send a PUT request directly to the update route. Always verify permissions before performing sensitive actions.

You'll notice session.flash('success', 'Post updated successfully') in the update method. This is our first use of flash messages in DevShow, so let's understand what they do.

Flash messages are temporary messages stored in the session. They're available on the next request only, then automatically removed. This makes them perfect for showing success or error messages after form submissions.

You don't need to add any code to display these messages — the starter kit's layout already includes a component that renders flash messages automatically. When a flash message is set, it will appear as a notification at the top of the page on the next request.

We'll use flash messages throughout the rest of this chapter whenever we want to confirm that an action (like updating or deleting) was successful.

Now let's register the routes for editing posts. Open your routes file.

We need two routes (one to show the edit form and another to handle the form submission). Both require authentication.

Create the edit form template.

Now add the form markup.

This form is similar to the create form, with a few key differences:

Now add an Edit button to the post detail page. Open your posts/show.edge template.

The @can tag checks the policy method in your template, similar to how bouncer.authorize() works in controllers:

Non-owners won't even see the Edit button in the page source. If someone tries to visit the edit URL directly, they still get a 403 error from the controller's authorization check.

Visit a post you created and you'll see the Edit button. Click it and try updating your post!

Deleting a post is simpler than editing because there's no form to show (just a button that submits a DELETE request). Let's add the controller method to handle deletions.

The pattern is familiar by now: find the post, authorize the action using the policy, perform the deletion, flash a success message, and redirect. After deleting a post, we redirect to the posts index page since the post detail page no longer exists.

Now register the delete route.

Add a delete button next to the edit button in your post detail template.

A few important things about this delete button:

Try it out! Visit a post you created and you'll see both Edit and Delete buttons. Visit a post created by someone else and no buttons appear.

Let's add the controller method for deleting comments.

Here's what this method does:

Now register the delete route for comments.

Finally, add delete button to the comments list in your post detail template.

How the comment delete button works:

Visit a post with comments you created and you'll see delete buttons next to your comments. Try viewing comments from other users and no delete buttons will appear.

You've successfully added authorization to DevShow using Bouncer's policy system. Here's what you accomplished:

The key benefit of this approach is that your authorization logic is reusable and maintainable. When you need to change a permission rule, you update it in one place (the policy), and it automatically applies everywhere you use that policy (in controllers, templates, and anywhere else in your application).

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/bouncer
```

Example 2 (unknown):
```unknown
node ace make:policy post
```

Example 3 (python):
```python
import type User from '#models/user'
import type Post from '#models/post'
import { BasePolicy } from '@adonisjs/bouncer'

export default class PostPolicy extends BasePolicy {
  /**
   * Only the post owner can edit their post
   */
  edit(user: User, post: Post) {
    return user.id === post.userId
  }

  /**
   * Only the post owner can delete their post
   */
  delete(user: User, post: Post) {
    return user.id === post.userId
  }
}
```

Example 4 (unknown):
```unknown
node ace make:policy comment
```

---

## Authorization - AdonisJS

**URL:** https://docs.adonisjs.com/tutorial/react/authorization

**Contents:**
- Authorization
- Overview
- Installing Bouncer
- Creating the PostPolicy
- Creating the CommentPolicy
- Adding edit functionality
    - Create the update validator
    - Add controller methods
    - Update the Post transformer to include authorization
    - Register the routes

In the previous chapter, we improved DevShow's navigation and styling. Now let's add the ability for users to edit and delete their own posts and comments. Right now, any logged-in user could modify anyone's content if we added those features. We need to add authorization checks to prevent this.

To handle permissions properly, we'll use AdonisJS's Bouncer package. Bouncer lets you organize authorization logic into policies (classes where each method represents a permission check). For example, a PostPolicy can have an edit method that checks if a user can edit a specific post.

Instead of scattering permission checks throughout your controllers, you define the rules once in a policy and use them everywhere. In this chapter, we'll install Bouncer, create policies for posts and comments, and implement edit and delete features with proper authorization.

Let's install and configure the Bouncer package using the following command.

Running this command will first install the package and then performs the following actions.

You're all set! Now let's create our first policy.

Policies are classes where each method represents a permission check. Let's create a policy for posts.

Open the generated file and add permission checks for editing and deleting posts.

Each policy method receives the currently logged-in user as the first parameter, followed by the resource being checked (in this case, the post). The method returns true if the user is allowed to perform the action, or false if they're not. Here, we're simply checking if the user's ID matches the post's userId.

You might notice that edit and delete have identical logic right now. Even though they're the same, keeping them separate gives you flexibility. Later, you might decide that posts can't be edited after 24 hours, or that admins can delete any post but can't edit them. Having separate methods makes these kinds of changes easier.

Now create a policy for comments.

Add the delete permission check.

Perfect! Now let's put these policies to work.

We'll add a validator for updating posts. Since we already have a validators/post.ts file for creating posts, we'll add the update validator there too. A single validator file can export multiple validators (this keeps related validation logic organized together).

Open your existing post validator file and add the update validator.

We're cloning the createPostValidator schema to reuse the same validation rules. This approach keeps our validation logic DRY (Don't Repeat Yourself). If you need to change a rule later, you only update it in one place. In many applications, you might want different rules for creating vs. updating, but for DevShow, the requirements are the same.

We'll add two controller methods: edit to show the edit form, and update to handle the form submission. Both methods will use Bouncer to check if the current user is allowed to modify the post before performing any action.

The key part here is bouncer.with(PostPolicy).authorize('edit', post). This line:

We check authorization in both methods. Even though edit checks permissions, someone could bypass the form and send a PUT request directly to the update route. Always verify permissions before performing sensitive actions.

You'll also notice session.flash('success', 'Post updated successfully') in the update method. Flash messages are temporary messages stored in the session that are available on the next request and then automatically removed. This is perfect for showing success or error messages after form submissions.

You don't need to add any code to display these messages — the starter kit's layout already includes a component that renders flash messages automatically. When a flash message is set, it will appear as a notification at the top of the page on the next request.

Now that we understand how to use policies in controllers, let's also use them in transformers to send authorization flags to the frontend.

Here's an important consideration: Bouncer policies run in the backend environment, so they cannot be imported or used directly in your React code. Your React components have no access to the backend's authorization logic.

The solution is to pre-compute user permissions within transformers and send them as flags to the frontend. Transformers run on the backend where they have access to policies, and can include permission checks in the serialized data.

We'll use a transformer variant for this. Variants allow you to define multiple output shapes for the same resource. For example, you might want minimal data for list views but detailed data (including permissions) for detail views. Learn more about variants in the Transformers documentation.

Let's add a forDetailedView variant to the PostTransformer:

Notice we're using the same bouncer.with(PostPolicy) pattern we used in the controller, but instead of .authorize() (which throws errors), we use .allows() (which returns boolean). The @inject() decorator allows us to access the HTTP context in our transformer.

When your React component receives this data, it has simple boolean flags (post.can.edit, post.can.delete) it can use for conditional rendering—without needing to know anything about the authorization logic itself.

Now update the show method to use this variant:

Now let's register the routes for editing posts. Open your routes file.

We need two routes (one to show the edit form and another to handle the form submission). Both require authentication.

Create the edit form component.

Now add the form markup.

This form is similar to the create form, with a few key differences:

Now add an Edit button to the post detail page. Open your posts/show.tsx component.

We're using conditional rendering with post.can?.edit to show the Edit button only to the post owner. The can object comes from our transformer's forDetailedView variant, which used the same PostPolicy we saw in the controller.

Non-owners won't even see the Edit button in the component. If someone tries to visit the edit URL directly, they still get a 403 error from the controller's authorization check.

Visit a post you created and you'll see the Edit button. Click it and try updating your post!

Deleting a post is simpler than editing because there's no form to show (just a button that submits a DELETE request). Let's add the controller method to handle deletions.

The pattern is familiar by now: find the post, authorize the action using the policy, perform the deletion, flash a success message, and redirect. After deleting a post, we redirect to the posts index page since the post detail page no longer exists.

Now register the delete route.

Add a delete button next to the edit button in your post detail component.

A few important things about this delete button:

Try it out! Visit a post you created and you'll see both Edit and Delete buttons. Visit a post created by someone else and no buttons appear.

Similar to posts, we need to add authorization data to comments. We'll use the same policy pattern we learned earlier. Create a variant in the CommentTransformer:

Now update the PostTransformer to use the comment authorization variant:

Let's add the controller method for deleting comments.

Here's what this method does:

Now register the delete route for comments.

Finally, add delete buttons to the comments list in your post detail component.

How the comment delete button works:

Visit a post with comments you created and you'll see delete buttons next to your comments. Try viewing comments from other users and no delete buttons will appear.

You've successfully added authorization to DevShow using Bouncer's policy system. Here's what you accomplished:

The key benefit of this approach is that your authorization logic lives entirely on the backend where it can't be bypassed. Bouncer policies run in a secure environment, and transformers send pre-computed permission flags to React components for UI decisions. This keeps your frontend simple while maintaining security.

**Examples:**

Example 1 (elixir):
```elixir
node ace add @adonisjs/bouncer
```

Example 2 (unknown):
```unknown
node ace make:policy post
```

Example 3 (python):
```python
import type User from '#models/user'
import type Post from '#models/post'
import { BasePolicy } from '@adonisjs/bouncer'

export default class PostPolicy extends BasePolicy {
  /**
   * Only the post owner can edit their post
   */
  edit(user: User, post: Post) {
    return user.id === post.userId
  }

  /**
   * Only the post owner can delete their post
   */
  delete(user: User, post: Post) {
    return user.id === post.userId
  }
}
```

Example 4 (unknown):
```unknown
node ace make:policy comment
```

---
