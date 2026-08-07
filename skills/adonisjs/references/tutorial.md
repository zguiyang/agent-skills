# Tutorial — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [tutorial/hypermedia/authorization](https://docs.adonisjs.com/tutorial/hypermedia/authorization)
- [tutorial/hypermedia/cli-and-repl](https://docs.adonisjs.com/tutorial/hypermedia/cli-and-repl)
- [tutorial/hypermedia/database-and-models](https://docs.adonisjs.com/tutorial/hypermedia/database-and-models)
- [tutorial/hypermedia/forms-and-validation](https://docs.adonisjs.com/tutorial/hypermedia/forms-and-validation)
- [tutorial/hypermedia/overview](https://docs.adonisjs.com/tutorial/hypermedia/overview)
- [tutorial/hypermedia/routes-controller-views](https://docs.adonisjs.com/tutorial/hypermedia/routes-controller-views)
- [tutorial/hypermedia/styling-and-cleanup](https://docs.adonisjs.com/tutorial/hypermedia/styling-and-cleanup)
- [tutorial/react/authorization](https://docs.adonisjs.com/tutorial/react/authorization)
- [tutorial/react/cli-and-repl](https://docs.adonisjs.com/tutorial/react/cli-and-repl)
- [tutorial/react/database-and-models](https://docs.adonisjs.com/tutorial/react/database-and-models)
- [tutorial/react/forms-and-validation](https://docs.adonisjs.com/tutorial/react/forms-and-validation)
- [tutorial/react/overview](https://docs.adonisjs.com/tutorial/react/overview)
- [tutorial/react/routes-controller-views](https://docs.adonisjs.com/tutorial/react/routes-controller-views)
- [tutorial/react/styling-and-cleanup](https://docs.adonisjs.com/tutorial/react/styling-and-cleanup)

## Condensed excerpts (prefer live docs if conflict)

### tutorial/hypermedia/authorization
Source: https://docs.adonisjs.com/tutorial/hypermedia/authorization

Authorization (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Authorization 

 [link:/tutorial/hypermedia/authorization] Hypermedia  [link:/tutorial/react/authorization] React 
Authorization 
In the previous chapter, we improved DevShow's navigation and styling. Now let's add the ability for users to edit and delete their own posts and comments. Right now, any logged-in user could modify anyone's content if we added those features. We need to add authorization checks to prevent this. 
Overview 
To handle permissions properly, we'll use  [link:/guides/auth/authorization] AdonisJS's Bouncer package . Bouncer lets you organize authorization logic into policies (classes where each method represents a permission check). For example, a can have an method that checks if a user can edit a specific post. 
Instead of scattering permission checks throughout your controllers, you define the rules once in a policy and use them everywhere. In this chapter, we'll install Bouncer, create policies for posts and comments, and implement edit and delete features with proper authorization. 
Installing Bouncer 
Let's install and configure the Bouncer package using the following command. 

```
node ace add @adonisjs/bouncer
```

Running this command will first install the package and then performs the following actions. 
Creates an 
```
app/abilities/main.ts
```
file where you can define authorization abilities (we won't need this file for now, so don't worry about it) 
Registers a middleware that initializes Bouncer for every HTTP request 
Makes the object available on the , so you can use it in your controllers 
You're all set! Now let's create our first policy. 
Creating the PostPolicy 
Policies are classes where each method represents a permission check. Let's create a policy for posts. 

```
node ace make:policy post
```

Open the generated file and add permission checks for editing and deleting posts. 
app/policies/post_policy.ts 

```
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

Each policy method receives the currently logged-in user as the first parameter, followed by the resource being checked (in this case, the ). The method returns if the user is allowed to perform the action, or if they're not. Here, we're simply checking if the user's ID matches the post's . 
You might notice that and have identical logic right now. Even though they're the same, keeping them separate gives you flexibility. Later, you might decide that posts can't be edited after 24 hours, or that admins can delete any post but can't edit them. Having separate methods makes these kinds of changes easier. 
Creating the CommentPolicy 
Now create a policy for comments. 

```
node ace make:policy comment
```

Add the delete permission check. 
app/policies/comment_policy.ts 

```
import type User from '#models/user'
import type Comment from '#models/comment'
import { BasePolicy } from '@adonisjs/bouncer'

export default class CommentPolicy extends BasePolicy {
  /**
   * Only the comment owner can delete their comment
   */
  delete(user: User, comment: Comment) {
    return user.id === comment.userId
  }
}
```

Perfect! Now let's put these policies to work. 
Adding edit functionality 
Create the update validator 
We'll add a validator for updating posts. Since we already have a file for creating posts, we'll add the update validator there too. A single validator file can export multiple validators (this keeps related validation logic organized together). 
Open your existing post validator file and add the update validator. 
app/validators/post.ts 

```
import vine from '@vinejs/vine'

export const createPostValidator = vine.create({
  title: vine.string().minLength(3).maxLength(255),
  url: vine.string().url(),
  summary: vine.string().minLength(80).maxLength(500),
})

/**
 * Same validation rules as creating a post
 */
export const updatePostValidator = vine.create(
  createPostValidator.schema.clone()
)
```

We're cloning the schema to reuse the same validation rules. This approach keeps our validation logic DRY (Don't Repeat Yourself). If you need to change a rule later, you only update it in one place. In many applications, you might want different rules for creating vs. updating, but for DevShow, the requirements are the same. 

Add controller methods 
We'll add two controller methods: to show the edit form, and to handle the form submission. Both methods will use Bouncer to check if the current user is allowed to modify the post before performing any action. 
app/controllers/posts_controller.ts 

```
import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import { createPostValidator, updatePostValidator } from '#validators/post'
import PostPolicy from '#policies/post_policy'

export default class PostsController {
  // ... existing methods (index, create, store, show)

  /**
   * Show the edit form
   */
  async edit({ bouncer, params, view }: HttpContext) {
    const post = await Post.findOrFail(params.id)

    // Check if the current user can edit this post
    await bouncer.with(PostPolicy).authorize('edit', post)

    return view.render('posts/edit', { post })
  }

  /**
   * Update the post
   */
  async update({ bouncer, params, request, response, session }: HttpContext) {
    const post = await Post.findOrFail(params.id)

    // Check authorization again. Someone could send a PUT request directly
    await bouncer.with(PostPolicy).authorize('edit', post)

    // Validate and update the post
    const data = await request.validateUsing(updatePostValidator)
    await post.merge(data).save()

    session.flash('success', 'Post updated successfully')
    return response.redirect().toRoute('posts.show', { id: post.id })
  }
}
```

The key part here is 
```
bouncer.with(PostPolicy).authorize('edit', post)
```
. This line: 
Calls the method in our 
Passes the the post to the policy method 
If the policy returns , Bouncer automatically throws a 403 Forbidden error 
If the policy returns , the code continues executing 
Notice we check authorization in both methods. Even though checks permissions, someone could bypass the form and send a PUT request directly to the route. Always verify permissions before performing sensitive actions. 

Understanding flash messages 
You'll notice 
```
session.flash('success', 'Post updated successfully')
```
in the method. This is our first use of flash messages in DevShow, so let's understand what they do. 
 [link:/guides/basics/session#flash-messages] Flash messages are temporary messages stored in the s

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### tutorial/hypermedia/cli-and-repl
Source: https://docs.adonisjs.com/tutorial/hypermedia/cli-and-repl

Commandline and REPL (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Commandline and REPL 

 [link:/tutorial/hypermedia/cli-and-repl] Hypermedia  [link:/tutorial/react/cli-and-repl] React 
Command line and REPL 
You might be wondering why we're covering CLI and REPL instead of jumping straight into building features. Here's why: throughout this tutorial, you'll constantly use Ace commands to generate controllers, models, and other files. Getting familiar with the CLI now prevents us from interrupting the flow later. 
More importantly, the  [link:/guides/ace/repl] REPL will become our playground for experimenting with models and databases. When we explore database queries, filters, and relationships in later sections, we'll use the REPL to try things out. It's a throwaway environment that lets us focus on learning concepts without the ceremony of building complete features. 
Exploring available commands 
Let's start by seeing what commands AdonisJS gives us. Run this in your terminal. 

You should see something like this: 

Notice how the commands are grouped together? 
The commands help you generate files. 
The commands help you run and revert database migrations. 
The commands handle database seeding, and so on. 
Want to know more about a specific command? Just add to the end. This shows you everything that command can do, including any options you can pass to it. 

```
node ace make:controller --help
```

Using the REPL 
The REPL will be our experimentation playground throughout the tutorial. Let's explore how to use it by creating and querying users for our DevShow web-app. 
Start the REPL and load models 
First, start the REPL: 

Once the REPL starts, load all your models using the helper. The REPL provides several built-in helper functions like this to make experimentation easier. This helper will make all your models available under the namespace. 

```
await loadModels()

// Access user model
models.user
```

Create users 
Let's use the model (stored within the file) to create a couple of users that we can use to log into our app later. The method accepts the model properties as an object, persists them to the database and returns a model instance. 

```
await models.user.create({ fullName: 'Harminder Virk', email: 'virk@adonisjs.com', password: 'demo' })
```

Let's create another user. 

```
await models.user.create({ fullName: 'Jane Doe', email: 'jane@example.com', password: 'demo' })
```

Fetch all users 
Now that you have created a couple of users, let's fetch them using the method. This method will execute a query and returns an array containing both users. Each user is a User model instance, not a plain JavaScript object. 

```
await models.user.all()
```

Find and delete a user 
You can find a user with a given ID using the method. The return value is an instance of the User model or (if no user was found). 

```
const user = await models.user.find(1)

user.id
// 1

user.email
// 'virk@adonisjs.com'
```

You can delete this user by simply calling the method on the User instance. 

```
await user.delete()

user.$isDeleted // true
```

If you list all users again, you should see only Jane remains: 

```
await models.user.all()
```

Exit the REPL 
When you're done exploring, type or press to leave the REPL and return to your terminal. 

 [link:/tutorial/hypermedia/overview] Previous  [link:/tutorial/hypermedia/database-and-models] Database and models Create models and database migrations for the DevShow tutorial application, define relationships, and seed test data using factories. 

Next

---

### tutorial/hypermedia/database-and-models
Source: https://docs.adonisjs.com/tutorial/hypermedia/database-and-models

Database and models (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Database and models 

 [link:/tutorial/hypermedia/database-and-models] Hypermedia  [link:/tutorial/react/database-and-models] React 
Database and Models 
In this chapter, you will create models and migrations for the Post and Comment resources, establish relationships between them, generate dummy data using factories and seeders, and query your data using the REPL. 
Overview 
This chapter introduces Lucid, AdonisJS's SQL ORM. Instead of writing raw SQL queries, you'll work with JavaScript classes called models that represent your database tables. Throughout this chapter and the rest of the tutorial, you'll interact with your database exclusively through models. 
An important distinction: models define how you interact with data, but they don't modify the database structure. That's the job of migrations , which create and alter tables. You'll use both as you build DevShow's database structure. 
Note 
A note on learning: This chapter introduces several database concepts at once. Don't worry if you don't fully understand everything - the goal is to learn by doing and get something working. Deeper understanding will come with practice. 

Creating the Post model 
Our app needs posts, so let's create a Post model and its corresponding database migration. In AdonisJS, you create one model per database table. Lucid uses naming conventions to automatically connect models to their tables - a model maps to a table, a model maps to a table, and so on. 
Generate the model and migration 
Run this command to create both files at once. 

```
node ace make:model Post -m
```

The flag tells Ace to create a migration file alongside the model. You'll see this output. 

```
DONE:    create app/models/post.ts
DONE:    create database/migrations/1763866156451_create_posts_table.ts
```

Understanding the generated model 
Let's look at what was generated in the model file. 
app/models/post.ts 

```
import { PostSchema } from '#database/schema'

export default class Post extends PostSchema {
}
```

The model extends — a class that is auto-generated from your database migrations. You don't need to define columns in your model file. When you run migrations, AdonisJS scans your database tables and generates the file with all column definitions, types, and decorators. Your model file is where you add relationships and business logic. 

Define the table structure in the migration 
Let's update the migration file to define the database table structure. This is where you add columns — the model will pick them up automatically after running the migration. 
database/migrations/1763866156451_create_posts_table.ts 

```
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

A few important things about migrations: 
The method runs when you execute the migration and creates the table. 
The method runs when you roll back the migration and drops the table. 
Notice that column names in the database use (like ), while your model properties use (like ). Lucid handles this conversion automatically. 

Creating the Comment model 
Let's create the Comment model following the same process we used for posts. 
Generate the model and migration 
Run this command. 

```
node ace make:model Comment -m
```

You'll see output showing the created files. 

```
DONE:    create app/models/comment.ts
DONE:    create database/migrations/1763866347711_create_comments_table.ts
```

Define the table structure in the migration 
Update the migration to create the comments table with a content column. 
database/migrations/1763866347711_create_comments_table.ts 

```
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.text('content').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

Running migrations 
Now let's create these tables in your database by running the migrations. 

```
node ace migration:run
```

You'll see output showing which migrations were executed. 

```
❯ migrated database/migrations/1763866156451_create_posts_table
❯ migrated database/migrations/1763866347711_create_comments_table
```

Your database now has and tables! You'll also notice that has been updated with and classes containing all the column definitions. This file is auto-generated every time you run migrations — you never need to edit it manually. 
Migrations are tracked in a special table in your database. Once a migration runs successfully, it won't run again even if you execute 
```
node ace migration:run
```
multiple times. 
Adding relationships 
Right now our posts and comments exist independently, but in our DevShow web-app, comments belong to posts and posts belong to users. We need to establish these connections in our database and models. 
To create these relationships, we need foreign key columns in our tables. A foreign key is a column that references the primary key of another table. For example, a column in the comments table will reference the column in the posts table, linking each comment to its post. 
Since our tables already exist, we'll create a new migration to add these foreign key columns. 
Create a migration for foreign keys 
The following command will create a new migration file that will modify our existing tables. 

```
node ace make:migration add_foreign_keys_to_posts_and_comments
```

Add foreign key columns 
Update the migration file to add the foreign key columns. 
database/migrations/1732089800000_add_foreign_keys_to_posts_and_comments.ts 

```
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    /**
     * Add user_id to posts table
     */
    this.schema.alterTable('posts', (table) => {
      table.integer('user_id').unsigned().notNullable()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')
    })

    /**
     * Add user_id and post_id to comments table
     */
    this.schema.alterTable('comments', (table) => {
      table.integer('user_id').unsigned().notNullable()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')

      table.integer('post_id').unsigned().notNullable()
      table.foreign('post_id').references('posts.id').onDelete('CASCADE')
    })

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### tutorial/hypermedia/forms-and-validation
Source: https://docs.adonisjs.com/tutorial/hypermedia/forms-and-validation

Forms and validation (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Forms and validation 

 [link:/tutorial/hypermedia/forms-and-validation] Hypermedia  [link:/tutorial/react/forms-and-validation] React 
Forms and Validation 
In this chapter, you'll first add the ability for authenticated users to create new posts. Then, you'll apply the same pattern to let users leave comments on existing posts. Along the way, you'll be introduced to AdonisJS's validation layer and learn how to organize your code using separate controllers for different resources. 
Note 
This tutorial covers basic form handling and validation. For advanced topics like custom validation rules, conditional validation, error message customization, and file uploads, see the  [link:/guides/basics/validation] Validation guide and  [link:https://vinejs.dev] VineJS documentation . 

Overview 
So far in the DevShow tutorial, you've built an application that displays posts from your database. But what about creating new posts? That's where forms come in. 
Handling forms involves three main steps: 
Displaying a form to collect user input. 
Validating that input on the server to ensure it meets your requirements. 
Finally saving the validated data to your database. 
AdonisJS provides Edge form components that render standard HTML form elements with automatic CSRF protection, and  [link:https://vinejs.dev/docs/introduction] VineJS for defining validation rules. 
Adding post creation 
Let's start by adding the ability for users to create new posts. We'll need a controller method to display the form, routes to wire everything up, and a template for the form itself. 
Add controller methods 
First, let's add a method to your that will render the form for creating a new post. We'll also stub out a method that we'll implement later to handle the form submission. 
app/controllers/posts_controller.ts 

```
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

Register the routes 
Now let's wire up the routes. We need two: one to display the form and another to handle submissions. Both should only be accessible to logged-in users. 
Warning 
The route must be defined before the route. 

start/routes.ts 

```
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

router.get('/posts', [controllers.Posts, 'index'])

router.get('/posts/create', [controllers.Posts, 'create']).use(middleware.auth())
router.post('/posts', [controllers.Posts, 'store']).use(middleware.auth())

router.get('/posts/:id', [controllers.Posts, 'show'])
```

The middleware ensures only logged-in users can access these routes. Unauthenticated visitors will be redirected to the login page. 

Create the form template 
Create the template for the form using the Ace CLI. 

```
node ace make:view posts/create
```

This creates 
```
resources/views/posts/create.edge
```
. Open it and add the following form. 
resources/views/posts/create.edge 

```
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

These Edge form components are part of the starter kit. They render standard HTML elements with helpful features like automatic CSRF protection (via ) and validation error display (via ). 

Create a validator 
Before handling form submissions, we need to define validation rules. AdonisJS uses  [link:https://vinejs.dev] VineJS for validation , a schema-based validation library that lets you define rules for your data. 
Create a validator using the Ace CLI. 

```
node ace make:validator post
```

This creates 
```
app/validators/post.ts
```
. Add a to validate post creation. 
app/validators/post.ts 

```
import vine from '@vinejs/vine'

/**
 * Validates the post's creation form
 */
export const createPostValidator = vine.create({
  title: vine.string().minLength(3).maxLength(255),
  url: vine.string().url(),
  summary: vine.string().minLength(80).maxLength(500),
})
```

The method creates a pre-compiled validator from a schema. Inside, we define each field with its type and rules. 
The field must be string between 3-255 characters. 
The field must be a string and formatted as a URL. 
The field must be between 80-500 characters. 

Implement the store method 
Now let's implement the method to validate the data, create the post, and redirect the user. 
app/controllers/posts_controller.ts 

```
import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import { createPostValidator } from '#validators/post'

export default class PostsController {
  // ... existing methods

  async store({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator)

    await Post.create({
      ...payload,
      userId: auth.user!.id,
    })

    return response.redirect().toRoute('posts.index')
  }
}
```

When the form is submitted, 
```
request.validateUsing()
```
validates the data. 
If validation fails, the user is automatically redirected back with errors that appear next to the relevant fields. 
If validation succeeds, we create the post and associate it with the logged-in user using (available via the HTTP context), then redirect to the posts index. 
Now visit  [link:http://localhost:3333/posts/create] , fill out the form, and submit it. Your new post should appear on the posts page! Try submitting invalid data (like a short summary or invalid URL) to see the validation errors in actio

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### tutorial/hypermedia/overview
Source: https://docs.adonisjs.com/tutorial/hypermedia/overview

Overview (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Overview 

 [link:/tutorial/hypermedia/overview] Hypermedia  [link:/tutorial/react/overview] React 
Building DevShow - A Community showcase website 
In this tutorial, you will build DevShow. DevShow is a small community showcase website where users can share what they've built. Every user can create an account, publish a "showcase entry" (a project, tool, experiment, or anything they're proud of), and browse entries created by others. 
Overview 
We're taking a hands-on approach in this tutorial by building a real application from start to finish. Instead of learning about features in isolation, you will see how everything in AdonisJS works together: routing, controllers, models, validation, authentication, and templating all coming together to create a functioning web application . 
By the end of this tutorial, you'll have built: 
Post listing and detail pages - Display all posts and individual post details with comments 
Post creation and editing - Forms to create and update posts with validation 
Comment system - Allow users to comment on posts 
Authorization - Ensure users can only edit/delete their own posts and comments 
Navigation and styling - Polished UI with proper navigation between pages 
The authentication system (signup, login, logout) is already included in your starter kit and fully functional. 
Understanding the starter kit 
We're starting with the AdonisJS Hypermedia starter kit, which already has authentication built in. Let's see what we have to work with by opening the routes file. 
start/routes.ts 

```
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

The starter kit gives us user signup, login, and logout routes. Notice how ensures only logged-out users can access signup/login, while protects the logout route. 
Note 
We'll use the middleware throughout the tutorial to protect routes that require authentication. 

How controllers work 
Let's look at the signup controller to see how requests flow through the application. 
app/controllers/new_account_controller.ts 

```
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

Each controller method receives an HTTP context object as its first parameter. The context contains everything about the current request: the request data, response object, auth state, view renderer, and more. We destructure just the properties we need ( for rendering templates, for form data, for redirects, and for authentication). 
The method simply shows the signup form. The method does the heavy lifting. It validates data, creates the user, logs them in, and redirects home. This pattern of bringing together validators, models, and auth is what you'll see throughout the tutorial . 
You might notice the controller references a model and a . The starter kit already includes these. We'll explore how models work in the  [link:/tutorial/hypermedia/database-and-models] Database and Models chapter and validators in the  [link:/tutorial/hypermedia/forms-and-validation] Forms and Validation chapter. 
How views work 
When a controller calls 
```
view.render('pages/auth/signup')
```
, AdonisJS looks for a template file and renders it as HTML. Let's see what that signup view looks like. 
resources/views/pages/auth/signup.edge 

```
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

Views live in the directory. AdonisJS uses Edge as its templating engine. Edge templates look similar to HTML but with special tags that start with . 
The tag wraps the page content with a common layout (header, footer, CSS). The and tags are components that come with the starter kit. They render standard HTML form elements with built-in features like CSRF protection and validation error display. 
When you visit , the route calls the controller's method, which renders this view, and Edge converts it to HTML that your browser displays. 
Try creating an account 
Before we move forward, start your development server with and try creating an account. Get comfortable with how the starter kit works. We'll be building on this foundation. 

 [link:/faqs] Previous  [link:/tutorial/hypermedia/cli-and-repl] Commandline and REPL Learn to use the AdonisJS Ace CLI and REPL to generate files and interact with your application during the DevShow tutorial. 

Next

---

### tutorial/hypermedia/routes-controller-views
Source: https://docs.adonisjs.com/tutorial/hypermedia/routes-controller-views

In the previous chapter, we created the Post and Comment models with their database tables and relationships. Now we'll bring those models to life by building pages where users can actually see posts.

Note

This tutorial covers basic routing, controllers, and views. For advanced topics like route groups, middleware, named routes, route parameters validation, and Edge template components, see the [Routing guide](https://docs.adonisjs.com/guides/basics/routing) , [Controllers guide](https://docs.adonisjs.com/guides/basics/controllers) , and [Edge documentation](https://edgejs.dev/) .

## Overview

Right now, your posts and comments exist only in the database. Let's build two pages: one that lists all posts, and another that shows a single post with its comments.

This is where you'll see the complete MVC (Model-View-Controller) pattern in action — **models handle data**, **controllers coordinate logic**, and **views display everything to users**.

Before we begin, make sure your development server is running.

`node ace serve --hmr`

## Displaying the posts list

Let's build the complete feature for displaying a list of posts. We'll create a controller, add a method to fetch posts, register a route, and create the view template.

1.   #### Creating the controller

Start by creating a controller to handle posts-related requests. Run this command.

`node ace make:controller posts` 
This creates a new file at `app/controllers/posts_controller.ts`. Open it up and you'll see a basic controller class. Let's add a method to list all posts.

```
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
A few things to note here:

    *   We're preloading the `user` relationship so we can display the author's name without extra queries
    *   We're ordering posts by creation date with newest first
    *   And passing the posts to a view template called `posts/index`.

2.   #### Defining the route

Open your routes file and register a route.

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.on('/').render('pages/home').as('home')
router.get('/posts', [controllers.Posts, 'index'])
``` 
The route definition connects the `/posts` URL to your controller's `index` method. When someone visits `/posts`, AdonisJS will call `PostsController.index()` and return whatever that method returns.

Note 
The `#generated/controllers` import is automatically generated by AdonisJS and provides type-safe references to your controllers. The development server watches for new controllers and regenerates this file automatically — this is why the dev server must be running when you create new controllers. For more details on how this works, see the [Controllers guide](https://docs.adonisjs.com/guides/basics/controllers#the-barrel-file) . 
3.   #### Creating the view template

Time to create the view template.

`node ace make:view posts/index` 
This creates a new file at `resources/views/posts/index.edge`. Open it and add the following code inside it.

```
@layout()
  <div class="container">
    <div class="posts-list-title">
      <h1> Posts </h1>
    </div>

    @each(post in posts)
      <div class="post-item">
        <h2> {{ post.title }} </h2>

        <div class="post-meta">
          <div>By {{ post.user.fullName }}</div>

          <span>.</span>
          <div><a href="{{ post.url }}" target="_blank">{{post.url}}</a></div>

          <span>.</span>
          <div><a href="/posts/{{ post.id }}"> View comments </a></div>
        </div>
      </div>
    @end
  </div>
@end
``` 
This template uses the existing `layout` component that came with your starter kit. The layout handles the basic HTML structure, and you provide the main content by wrapping it in `@layout` tag.

Inside, we loop through each post with `@each` and display its title, the author's name, and a link to view post comments.

Visit [`/posts`](http://localhost:3333/posts) and you should see a list of all your posts!

## Displaying a single post

Now let's add the ability to view an individual post with its details. We'll implement the controller method, register the route with a dynamic parameter, and create the view template.

1.   #### Implementing the controller method

Add the `show` method to your controller.

```
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({ view }: HttpContext) {
    const posts = await Post
      .query()
      .preload('user')
      .orderBy('createdAt', 'desc')

    return view.render('posts/index', { posts })
  }

  async show({ params, view }: HttpContext) {
    const post = await Post
      .query()
      .where('id', params.id)
      .preload('user')
      .firstOrFail()

    return view.render('posts/show', { post })
  }
}
``` 
We're using `firstOrFail()` here, which will automatically throw a 404 error if no post exists with that ID. No need to manually check if the post exists—AdonisJS handles that for you.

2.   #### Registering the route

Now let's register the route for this controller method.

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/posts', [controllers.Posts, 'index'])
router.get('/posts/:id', [controllers.Posts, 'show'])
``` 
    *   The `:id` part is a route parameter.
    *   When someone visits `/posts/5`, AdonisJS captures that `5` and makes it available in your controller as `params.id`.
    *   You can name the parameter anything you want, `:id`, `:postId`, `:slug` — just be consistent when accessing it.

3.   #### Creating the view template

Create the view template for displaying a single post.

`node ace make:view posts/show` 
This creates `resources/views/posts/show.edge`. Open it and add the following code.

```
@layout()
  <div class="container">
    <div>
      <h1>
        {{ post.title }}
      </h1>
    </div>

    <div class="post">
      <div class="post-meta">
        <div>By {{ post.user.fullName }}</div>

        <span>.</span>
        <div><a href="{{ post.url }}" target="_blank">{{post.url}}</a></div>
      </div>

      <div class="post-summary">
        {{ post.summary }}
      </div>
    </div>
  </div>
@end
``` 
Try clicking on a post from your [list page](http://localhost:3333/posts) . You should now see the full post with its title, author, and content.

## Using named routes

Right now, we're hardcoding URLs like `/posts/{{ post.id }}` in our templates. This works, but what happens if we decide to change our URL pattern from `/posts/:id` to `/showcase/:id`? We'd have to find and replace every hardcoded URL throughout our application.

This is where **nam

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### tutorial/hypermedia/styling-and-cleanup
Source: https://docs.adonisjs.com/tutorial/hypermedia/styling-and-cleanup

Styling and cleanup (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Styling and cleanup 

 [link:/tutorial/hypermedia/styling-and-cleanup] Hypermedia  [link:/tutorial/react/styling-and-cleanup] React 
Styling and Cleanup 
In the previous chapter, we added forms to create posts and comments. We're not done building DevShow yet — there are more features to add — but we've built enough that it's worth pausing to improve the design and user experience. 
Right now, users can't easily navigate between pages, and the design looks bare. Let's fix both by adding proper navigation links and styling everything with CSS. 
Styling the application 
Let's start by adding CSS to make DevShow look polished. The Hypermedia starter kit already includes a CSS file with some base styles. We'll add DevShow-specific styles to enhance the posts, comments, and overall layout. 
Open your CSS file and add the following styles at the end. 
resources/css/app.css 

```
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

These styles use CSS variables like and that are already defined in the starter kit's base styles. They provide consistent spacing, typography, and color throughout DevShow. 
Refresh your browser and visit  [link:http://localhost:3333/posts] . You should immediately see improved styling with better spacing, cleaner borders, and more readable typography. 
Updating the homepage 
Right now, the homepage doesn't tell users what DevShow is or how to get started. Let's replace it with a proper landing page that explains the site and links to the posts listing. 
Replace the entire content of your homepage with this: 
resources/views/pages/home.edge 

```
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

 [link:/tutorial/hypermedia/routes-controller-views#using-named-routes] In Chapter 4 , we learned about named routes and used the helper to generate URLs in our templates. This time, we use the component which accepts the route name as the parameter. The applies styling from the starter kit's CSS. 
Visit the homepage at  [link:http://localhost:3333] and you'll see the new landing page with a clear call-to-action button that takes users to the posts listing. 
Adding a post creation link 
Users who want to share their projects need an easy way to reach the creation form. Let's add a prominent button at the top of the posts listing. 
Update your posts index template to add the button in the header. 
resources/views/posts/index.edge 

```
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

The class uses flexbox (from the CSS we added earlier) to position the heading and button on opposite sides of the header. 
Visit  [link:http://localhost:3333/posts] and you'll see the new "Create new post" button in the top-right corner, making it easy for users to share their projects. 
Adding navigation to the post creation page 
When users are on the post creation form, they might want to go back to browsing posts. Let's add a back link at the top of the page. 
Update your posts create template. 
resources/views/posts/create.edge 

```
@layout()
  <div class="form-container">
    <div>
      @!link({
        route: 'posts.index',
        text: '‹ Go back to posts listing'
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

Visit  [link:http://localhost:3333/posts/create] and you'll see the back link above the heading, making navigation intuitive. 
Adding navigation to the post detail page 
Finally, let's add a back link on individual post pages so users can easily return to the full listing. 
Update your posts show template. 
resources/views/posts/show.edge 

```
@layout()
  <div class="container">
    <div>
      @!link({
        route: 'posts.index',
        text: '‹ Go back to posts listing'
      })
      <h1>
        {{ post.title }}
      </h1>
    </div>

    <div class="post">
      {{-- ... post details ... --}}
    </div>
  </div>
@end
```

Now visit any post detail page (click on a post from  [link:http://localhost:3333/posts] ) and you'll see the back link, completing the navigation flow throughout DevShow. 
What you built 
You've transformed DevShow's user experience with styling and navigation. Here's what you accomplished: 
Added CSS to style posts, comments, and overall layout with consistent spacing and typography 
Updated the homepage with a hero section that explains DevShow and links to posts 
Added a "Create new post" button on the posts listing for easy access 
Added back navigation links on the post creation and detail pages 
Improved the ov

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### tutorial/react/authorization
Source: https://docs.adonisjs.com/tutorial/react/authorization

Authorization (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Authorization 

 [link:/tutorial/hypermedia/authorization] Hypermedia  [link:/tutorial/react/authorization] React 
Authorization 
In the previous chapter, we improved DevShow's navigation and styling. Now let's add the ability for users to edit and delete their own posts and comments. Right now, any logged-in user could modify anyone's content if we added those features. We need to add authorization checks to prevent this. 
Overview 
To handle permissions properly, we'll use  [link:/guides/auth/authorization] AdonisJS's Bouncer package . Bouncer lets you organize authorization logic into policies (classes where each method represents a permission check). For example, a can have an method that checks if a user can edit a specific post. 
Instead of scattering permission checks throughout your controllers, you define the rules once in a policy and use them everywhere. In this chapter, we'll install Bouncer, create policies for posts and comments, and implement edit and delete features with proper authorization. 
Installing Bouncer 
Let's install and configure the Bouncer package using the following command. 

```
node ace add @adonisjs/bouncer
```

Running this command will first install the package and then performs the following actions. 
Creates an 
```
app/abilities/main.ts
```
file where you can define authorization abilities (we won't need this file for now, so don't worry about it) 
Registers a middleware that initializes Bouncer for every HTTP request 
Makes the object available on the , so you can use it in your controllers 
You're all set! Now let's create our first policy. 
Creating the PostPolicy 
Policies are classes where each method represents a permission check. Let's create a policy for posts. 

```
node ace make:policy post
```

Open the generated file and add permission checks for editing and deleting posts. 
app/policies/post_policy.ts 

```
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

Each policy method receives the currently logged-in user as the first parameter, followed by the resource being checked (in this case, the ). The method returns if the user is allowed to perform the action, or if they're not. Here, we're simply checking if the user's ID matches the post's . 
You might notice that and have identical logic right now. Even though they're the same, keeping them separate gives you flexibility. Later, you might decide that posts can't be edited after 24 hours, or that admins can delete any post but can't edit them. Having separate methods makes these kinds of changes easier. 
Creating the CommentPolicy 
Now create a policy for comments. 

```
node ace make:policy comment
```

Add the delete permission check. 
app/policies/comment_policy.ts 

```
import type User from '#models/user'
import type Comment from '#models/comment'
import { BasePolicy } from '@adonisjs/bouncer'

export default class CommentPolicy extends BasePolicy {
  /**
   * Only the comment owner can delete their comment
   */
  delete(user: User, comment: Comment) {
    return user.id === comment.userId
  }
}
```

Perfect! Now let's put these policies to work. 
Adding edit functionality 
Create the update validator 
We'll add a validator for updating posts. Since we already have a file for creating posts, we'll add the update validator there too. A single validator file can export multiple validators (this keeps related validation logic organized together). 
Open your existing post validator file and add the update validator. 
app/validators/post.ts 

```
import vine from '@vinejs/vine'

export const createPostValidator = vine.create({
  title: vine.string().minLength(3).maxLength(255),
  url: vine.string().url(),
  summary: vine.string().minLength(80).maxLength(500),
})

/**
 * Same validation rules as creating a post
 */
export const updatePostValidator = vine.create(
  createPostValidator.schema.clone()
)
```

We're cloning the schema to reuse the same validation rules. This approach keeps our validation logic DRY (Don't Repeat Yourself). If you need to change a rule later, you only update it in one place. In many applications, you might want different rules for creating vs. updating, but for DevShow, the requirements are the same. 

Add controller methods 
We'll add two controller methods: to show the edit form, and to handle the form submission. Both methods will use Bouncer to check if the current user is allowed to modify the post before performing any action. 
app/controllers/posts_controller.ts 

```
import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import PostTransformer from '#transformers/post_transformer'
import { createPostValidator, updatePostValidator } from '#validators/post'
import PostPolicy from '#policies/post_policy'

export default class PostsController {
  // ... existing methods (index, create, store, show)

  /**
   * Show the edit form
   */
  async edit({ bouncer, params, inertia }: HttpContext) {
    const post = await Post.findOrFail(params.id)

    // Check if the current user can edit this post
    await bouncer.with(PostPolicy).authorize('edit', post)

    return inertia.render('posts/edit', {
      post: PostTransformer.transform(post),
    })
  }

  /**
   * Update the post
   */
  async update({ bouncer, params, request, response, session }: HttpContext) {
    const post = await Post.findOrFail(params.id)

    // Check authorization again. Someone could send a PUT request directly
    await bouncer.with(PostPolicy).authorize('edit', post)

    // Validate and update the post
    const data = await request.validateUsing(updatePostValidator)
    await post.merge(data).save()

    session.flash('success', 'Post updated successfully')
    return response.redirect().toRoute('posts.show', { id: post.id })
  }
}
```

The key part here is 
```
bouncer.with(PostPolicy).authorize('edit', post)
```
. This line: 
Calls the method in our 
Passes the post to the policy method 
If the policy returns , Bouncer automatically throws a 403 Forbidden error 
If the policy returns , the code continues executing 
We check authorization in both methods. Even though checks permissions, someone could bypass the form and send a PUT request directly to the route. Always verify permissions before performing sensitive actions. 
You'll also notice 
```
session.flash('success', 'Post updated successfully')
```
in the method.  [link:/guides/basics/session#flash-messages] Flash messages are temporary messages stored in the session that a

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### tutorial/react/cli-and-repl
Source: https://docs.adonisjs.com/tutorial/react/cli-and-repl

Commandline and REPL (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Commandline and REPL 

 [link:/tutorial/hypermedia/cli-and-repl] Hypermedia  [link:/tutorial/react/cli-and-repl] React 
Command line and REPL 
You might be wondering why we're covering CLI and REPL instead of jumping straight into building features. Here's why: throughout this tutorial, you'll constantly use Ace commands to generate controllers, models, and other files. Getting familiar with the CLI now prevents us from interrupting the flow later. 
More importantly, the  [link:/guides/ace/repl] REPL will become our playground for experimenting with models and databases. When we explore database queries, filters, and relationships in later sections, we'll use the REPL to try things out. It's a throwaway environment that lets us focus on learning concepts without the ceremony of building complete features. 
Exploring available commands 
Let's start by seeing what commands AdonisJS gives us. Run this in your terminal. 

You should see something like this: 

Notice how the commands are grouped together? 
The commands help you generate files. 
The commands help you run and revert database migrations. 
The commands handle database seeding, and so on. 
Want to know more about a specific command? Just add to the end. This shows you everything that command can do, including any options you can pass to it. 

```
node ace make:controller --help
```

Using the REPL 
The REPL will be our experimentation playground throughout the tutorial. Let's explore how to use it by creating and querying users for our DevShow web-app. 
Start the REPL and load models 
First, start the REPL: 

Once the REPL starts, load all your models using the helper. The REPL provides several built-in helper functions like this to make experimentation easier. This helper will make all your models available under the namespace. 

```
await loadModels()

// Access user model
models.user
```

Create users 
Let's use the model (stored within the file) to create a couple of users that we can use to log into our app later. The method accepts the model properties as an object, persists them to the database and returns a model instance. 

```
await models.user.create({ fullName: 'Harminder Virk', email: 'virk@adonisjs.com', password: 'demo' })
```

Let's create another user. 

```
await models.user.create({ fullName: 'Jane Doe', email: 'jane@example.com', password: 'demo' })
```

Fetch all users 
Now that you have created a couple of users, let's fetch them using the method. This method will execute a query and returns an array containing both users. Each user is a User model instance, not a plain JavaScript object. 

```
await models.user.all()
```

Find and delete a user 
You can find a user with a given ID using the method. The return value is an instance of the User model or (if no user was found). 

```
const user = await models.user.find(1)

user.id
// 1

user.email
// 'virk@adonisjs.com'
```

You can delete this user by simply calling the method on the User instance. 

```
await user.delete()

user.$isDeleted // true
```

If you list all users again, you should see only Jane remains: 

```
await models.user.all()
```

Exit the REPL 
When you're done exploring, type or press to leave the REPL and return to your terminal. 

 [link:/tutorial/react/overview] Previous  [link:/tutorial/react/database-and-models] Database and models Create models and database migrations for the DevShow React tutorial application, define relationships, and seed test data using factories. 

Next

---

### tutorial/react/database-and-models
Source: https://docs.adonisjs.com/tutorial/react/database-and-models

Database and models (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Database and models 

 [link:/tutorial/hypermedia/database-and-models] Hypermedia  [link:/tutorial/react/database-and-models] React 
Database and Models 
In this chapter, you will create models and migrations for the Post and Comment resources, establish relationships between them, generate dummy data using factories and seeders, and query your data using the REPL. 
Overview 
This chapter introduces Lucid, AdonisJS's SQL ORM. Instead of writing raw SQL queries, you'll work with JavaScript classes called models that represent your database tables. Throughout this chapter and the rest of the tutorial, you'll interact with your database exclusively through models. 
An important distinction: models define how you interact with data, but they don't modify the database structure. That's the job of migrations , which create and alter tables. You'll use both as you build DevShow's database structure. 
Note 
A note on learning: This chapter introduces several database concepts at once. Don't worry if you don't fully understand everything - the goal is to learn by doing and get something working. Deeper understanding will come with practice. 

Creating the Post model 
Our app needs posts, so let's create a Post model and its corresponding database migration. In AdonisJS, you create one model per database table. Lucid uses naming conventions to automatically connect models to their tables - a model maps to a table, a model maps to a table, and so on. 
Generate the model and migration 
Run this command to create both files at once. 

```
node ace make:model Post -m
```

The flag tells Ace to create a migration file alongside the model. You'll see this output. 

```
DONE:    create app/models/post.ts
DONE:    create database/migrations/1763866156451_create_posts_table.ts
```

Understanding the generated model 
Let's look at what was generated in the model file. 
app/models/post.ts 

```
import { PostSchema } from '#database/schema'

export default class Post extends PostSchema {
}
```

The model extends — a class that is auto-generated from your database migrations. You don't need to define columns in your model file. When you run migrations, AdonisJS scans your database tables and generates the file with all column definitions, types, and decorators. Your model file is where you add relationships and business logic. 

Define the table structure in the migration 
Let's update the migration file to define the database table structure. This is where you add columns — the model will pick them up automatically after running the migration. 
database/migrations/1763866156451_create_posts_table.ts 

```
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

A few important things about migrations: 
The method runs when you execute the migration and creates the table. 
The method runs when you roll back the migration and drops the table. 
Notice that column names in the database use (like ), while your model properties use (like ). Lucid handles this conversion automatically. 

Creating the Comment model 
Let's create the Comment model following the same process we used for posts. 
Generate the model and migration 
Run this command. 

```
node ace make:model Comment -m
```

You'll see output showing the created files. 

```
DONE:    create app/models/comment.ts
DONE:    create database/migrations/1763866347711_create_comments_table.ts
```

Define the table structure in the migration 
Update the migration to create the comments table with a content column. 
database/migrations/1763866347711_create_comments_table.ts 

```
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'comments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.text('content').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
```

Running migrations 
Now let's create these tables in your database by running the migrations. 

```
node ace migration:run
```

You'll see output showing which migrations were executed. 

```
❯ migrated database/migrations/1763866156451_create_posts_table
❯ migrated database/migrations/1763866347711_create_comments_table
```

Your database now has and tables! You'll also notice that has been updated with and classes containing all the column definitions. This file is auto-generated every time you run migrations — you never need to edit it manually. 
Migrations are tracked in a special table in your database. Once a migration runs successfully, it won't run again even if you execute 
```
node ace migration:run
```
multiple times. 
Adding relationships 
Right now our posts and comments exist independently, but in our DevShow web-app, comments belong to posts and posts belong to users. We need to establish these connections in our database and models. 
To create these relationships, we need foreign key columns in our tables. A foreign key is a column that references the primary key of another table. For example, a column in the comments table will reference the column in the posts table, linking each comment to its post. 
Since our tables already exist, we'll create a new migration to add these foreign key columns. 
Create a migration for foreign keys 
The following command will create a new migration file that will modify our existing tables. 

```
node ace make:migration add_foreign_keys_to_posts_and_comments
```

Add foreign key columns 
Update the migration file to add the foreign key columns. 
database/migrations/1732089800000_add_foreign_keys_to_posts_and_comments.ts 

```
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    /**
     * Add user_id to posts table
     */
    this.schema.alterTable('posts', (table) => {
      table.integer('user_id').unsigned().notNullable()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')
    })

    /**
     * Add user_id and post_id to comments table
     */
    this.schema.alterTable('comments', (table) => {
      table.integer('user_id').unsigned().notNullable()
      table.foreign('user_id').references('users.id').onDelete('CASCADE')

      table.integer('post_id').unsigned().notNullable()
      table.foreign('post_id').references('posts.id').onDelete('CASCADE')
    })

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### tutorial/react/forms-and-validation
Source: https://docs.adonisjs.com/tutorial/react/forms-and-validation

Forms and validation (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Forms and validation 

 [link:/tutorial/hypermedia/forms-and-validation] Hypermedia  [link:/tutorial/react/forms-and-validation] React 
Forms and Validation 
In this chapter, you'll first add the ability for authenticated users to create new posts. Then, you'll apply the same pattern to let users leave comments on existing posts. Along the way, you'll be introduced to AdonisJS's validation layer and learn how to organize your code using separate controllers for different resources. 
Note 
This tutorial covers basic form handling and validation. For advanced topics like custom validation rules, conditional validation, error message customization, and file uploads, see the  [link:/guides/basics/validation] Validation guide and  [link:https://vinejs.dev] VineJS documentation . 

Overview 
So far in the DevShow tutorial, you've built an application that displays posts from your database. But what about creating new posts? That's where forms come in. 
Handling forms involves three main steps: 
Displaying a form to collect user input. 
Validating that input on the server to ensure it meets your requirements. 
Finally saving the validated data to your database. 
AdonisJS provides  [link:https://vinejs.dev/docs/introduction] VineJS for defining validation rules, and Inertia's component handles form submissions with automatic error handling. 
Adding post creation 
Let's start by adding the ability for users to create new posts. We'll need a controller method to display the form, routes to wire everything up, and a React component for the form itself. 
Add controller methods 
First, let's add a method to your that will render the form for creating a new post. We'll also stub out a method that we'll implement later to handle the form submission. 
app/controllers/posts_controller.ts 

```
import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import PostTransformer from '#transformers/post_transformer'

export default class PostsController {
  // ... existing methods (index, show)

  /**
   * Display the form for creating a new post
   */
  async create({ inertia }: HttpContext) {
    return inertia.render('posts/create', {})
  }

  /**
   * Handle the form submission for creating a new post
   */
  async store({}: HttpContext) {
    // We'll implement this later
  }
}
```

Register the routes 
Now let's wire up the routes. We need two: one to display the form and another to handle submissions. Both should only be accessible to logged-in users. 
Warning 
The route must be defined before the route. 

start/routes.ts 

```
import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'

router.get('/posts', [controllers.Posts, 'index'])

router.get('/posts/create', [controllers.Posts, 'create']).use(middleware.auth())
router.post('/posts', [controllers.Posts, 'store']).use(middleware.auth())

router.get('/posts/:id', [controllers.Posts, 'show'])
```

The middleware ensures only logged-in users can access these routes. Unauthenticated visitors will be redirected to the login page. 

Create the form component 
Create the React component for the form using the Ace CLI. 

```
node ace make:page posts/create
```

This creates 
```
inertia/pages/posts/create.tsx
```
. Open it and add the following form: 
inertia/pages/posts/create.tsx 

```
import { Form } from '@adonisjs/inertia/react'

export default function PostsCreate() {
  return (
    <div className="form-container">
      <div>
        <h1>Share your creation</h1>
        <p>Share the URL and a short summary of your creation</p>
      </div>

      <div>
        <Form route="posts.store">
          {({ errors }) => (
            <>
              <div>
                <label htmlFor="title">Post title</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  placeholder="Title of your creation"
                  data-invalid={errors.title ? 'true' : undefined}
                />
                {errors.title && <div>{errors.title}</div>}
              </div>

              <div>
                <label htmlFor="url">URL</label>
                <input
                  type="url"
                  name="url"
                  id="url"
                  placeholder="https://example.com/my-creation"
                  data-invalid={errors.url ? 'true' : undefined}
                />
                {errors.url && <div>{errors.url}</div>}
              </div>

              <div>
                <label htmlFor="summary">Short summary</label>
                <textarea
                  name="summary"
                  id="summary"
                  rows={4}
                  placeholder="Briefly describe what you are sharing"
                  data-invalid={errors.summary ? 'true' : undefined}
                />
                {errors.summary && <div>{errors.summary}</div>}
              </div>

              <div>
                <button type="submit" className="button">
                  Publish
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

The component from 
```
@adonisjs/inertia/react
```
handles form submissions. It accepts a prop (the named route to submit to) and provides an object through a render prop pattern. When you submit the form, Inertia sends the request to your backend and automatically handles the response, including displaying validation errors. 

Create a validator 
Before handling form submissions, we need to define validation rules. AdonisJS uses  [link:https://vinejs.dev] VineJS for validation , a schema-based validation library that lets you define rules for your data. 
Create a validator using the Ace CLI. 

```
node ace make:validator post
```

This creates 
```
app/validators/post.ts
```
. Add a to validate post creation. 
app/validators/post.ts 

```
import vine from '@vinejs/vine'

/**
 * Validates the post's creation form
 */
export const createPostValidator = vine.create({
  title: vine.string().minLength(3).maxLength(255),
  url: vine.string().url(),
  summary: vine.string().minLength(80).maxLength(500),
})
```

The method creates a pre-compiled validator from a schema. Inside, we define each field with its type and rules. 
The field must be string between 3-255 characters. 
The field must be a string and formatted as a URL. 
The field must be between 80-500 characters. 

Implement the store method 
Now let's implement the method to validate the data, create the post, and redirect the user. 
app/controllers/posts_controller.ts 

```
import type { HttpContext } from '@adonisjs/core/http'
import Post from '#models/post'
import PostTransformer from '#transformers/post_transformer'
import { createPostValidator } from 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### tutorial/react/overview
Source: https://docs.adonisjs.com/tutorial/react/overview

Overview (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Overview 

 [link:/tutorial/hypermedia/overview] Hypermedia  [link:/tutorial/react/overview] React 
Building DevShow - A Community showcase website 
In this tutorial, you will build DevShow. DevShow is a small community showcase website where users can share what they've built. Every user can create an account, publish a "showcase entry" (a project, tool, experiment, or anything they're proud of), and browse entries created by others. 
Overview 
We're taking a hands-on approach in this tutorial by building a real application from start to finish. Instead of learning about features in isolation, you will see how everything in AdonisJS and React works together: routing, controllers, models, validation, authentication, transformers, and React components all coming together to create a functioning web application . 
By the end of this tutorial, you'll have built: 
Post listing and detail pages - Display all posts and individual post details with comments 
Post creation and editing - Forms to create and update posts with validation 
Comment system - Allow users to comment on posts 
Authorization - Ensure users can only edit/delete their own posts and comments 
Navigation and styling - Polished UI with proper navigation between pages 
The authentication system (signup, login, logout) is already included in your starter kit and fully functional. 
Understanding the starter kit 
We're starting with the AdonisJS Inertia + React starter kit, which already has authentication built in. Let's see what we have to work with by opening the routes file. 
start/routes.ts 

```
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

The starter kit gives us user signup, login, and logout routes. Notice how ensures only logged-out users can access signup/login, while protects the logout route. 
Note 
We'll use the middleware throughout the tutorial to protect routes that require authentication. 

How controllers work with Inertia 
Let's look at the signup controller to see how requests flow through the application with Inertia. 
app/controllers/new_account_controller.ts 

```
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

Each controller method receives an HTTP context object as its first parameter. The context contains everything about the current request: the request data, response object, auth state, Inertia renderer, and more. We destructure just the properties we need ( for rendering React components, for form data, for redirects, and for authentication). 
The method renders the signup form using . Instead of returning HTML like traditional server-rendered apps, Inertia sends a JSON response containing the component name and any props. Your React frontend receives this and renders the corresponding component. 
The method does the heavy lifting. It validates data, creates the user, logs them in, and redirects home. This pattern of bringing together validators, models, and auth is what you'll see throughout the tutorial . 
You might notice the controller references a model and a . The starter kit already includes these. We'll explore how models work in the  [link:/tutorial/react/database-and-models] Database and Models chapter and validators in the  [link:/tutorial/react/forms-and-validation] Forms and Validation chapter. 
About Inertia and React 
If you've worked with meta-frameworks like Next.js or Remix, this starter kit might look unusual. Most of our code lives in AdonisJS (the backend), and React is only used to render views. There's no frontend routing, no isomorphic code running on both server and client, and no complex state management libraries. 
This is intentional. Inertia's philosophy is simple: keep your backend and frontend separate, but make them work together seamlessly. 
Your backend (AdonisJS) handles routing, authentication, database queries, validation, and business logic 
Your frontend (React) handles rendering and user interactions 
Inertia acts as the glue, sending JSON responses from your controllers to your React components 
If you're hearing about Inertia for the first time, you might want to visit  [link:https://inertiajs.com] inertiajs.com to learn more about its philosophy. Or just power through this tutorial and see for yourself how simple it is compared to the complexity cocktail offered by meta-frameworks. 
Here's how a request flows in an AdonisJS + Inertia app: 

```
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

How the signup form works 
When a controller calls 
```
inertia.render('auth/signup')
```
, Inertia looks for a React component at 
```
inertia/pages/auth/signup.tsx
```
and renders it. Let's look at that component. 
inertia/pages/auth/signup.tsx 

```
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
   

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### tutorial/react/routes-controller-views
Source: https://docs.adonisjs.com/tutorial/react/routes-controller-views

Routes, controllers and views (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Routes, controllers and views 

 [link:/tutorial/hypermedia/routes-controller-views] Hypermedia  [link:/tutorial/react/routes-controller-views] React 
Routes, controllers and views 
In the previous chapter, we created the Post and Comment models with their database tables and relationships. Now we'll bring those models to life by building pages where users can actually see posts. 
Note 
This tutorial covers basic routing, controllers, and views. For advanced topics like route groups, middleware, route parameters validation, and custom Inertia components, see the  [link:/guides/basics/routing] Routing guide ,  [link:/guides/basics/controllers] Controllers guide , and  [link:https://inertiajs.com] Inertia documentation . 

Overview 
Right now, your posts and comments exist only in the database. Let's build two pages: one that lists all posts, and another that shows a single post with its comments. 
This is where you'll see the complete flow in action — models handle data , transformers serialize it for the frontend , controllers coordinate logic , and React components display everything to users . 
Before we begin, make sure your development server is running. 

Displaying the posts list 
Let's build the complete feature for displaying a list of posts. We'll create a transformer to serialize post data, add a controller method to fetch posts, register a route, and create the React component. 
Creating the transformer 
Transformers convert your Lucid models into plain JSON objects that can be safely sent to your React frontend. They explicitly control what data gets serialized and generate TypeScript types for your components. 
Create a transformer for posts: 

```
node ace make:transformer post
```

This creates 
```
app/transformers/post_transformer.ts
```
. Open it and define what data to serialize: 
app/transformers/post_transformer.ts 

```
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

We're using to select specific fields from the Post model, and transforming the related with . The starter kit already includes , which serializes user data (id, fullName, email). 

Creating the controller 
Now create a controller to handle post-related requests. 

```
node ace make:controller posts
```

This creates 
```
app/controllers/posts_controller.ts
```
. Add a method to list all posts: 
app/controllers/posts_controller.ts 

```
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'
import PostTransformer from '#transformers/post_transformer'

export default class PostsController {
  async index({ inertia }: HttpContext) {
    const posts = await Post.query()
      .preload('user')
      .orderBy('createdAt', 'desc')

    return inertia.render('posts/index', {
      posts: PostTransformer.transform(posts),
    })
  }
}
```

A few things to note here: 
We're preloading the relationship so we can display the author's name without extra queries 
We're ordering posts by creation date with newest first 
We're using 
```
PostTransformer.transform()
```
to serialize the posts 

Defining the route 
Open your routes file and register a route. 
start/routes.ts 

```
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.on('/').renderInertia('home').as('home')
router.get('/posts', [controllers.Posts, 'index'])
```

The route connects the URL to your controller's method. When someone visits , AdonisJS calls 
```
PostsController.index()
```
and Inertia renders the React component with the posts data. 
Note 
The 
```
#generated/controllers
```
import is automatically generated by AdonisJS and provides type-safe references to your controllers. The development server watches for new controllers and regenerates this file automatically — this is why the dev server must be running when you create new controllers. For more details on how this works, see the  [link:/guides/basics/controllers#the-barrel-file] Controllers guide . 

Creating the React component 
Time to create the React component that will display the posts. 

```
node ace make:page posts/index
```

This creates 
```
inertia/pages/posts/index.tsx
```
. Open it and add the following code: 
inertia/pages/posts/index.tsx 

```
import { InertiaProps } from '~/types'
import { Data } from '@generated/data'

type PageProps = InertiaProps<{
  posts: Data.Post[]
}>

export default function PostsIndex(props: PageProps) {
  const { posts } = props

  return (
    <div className="container">
      <div className="posts-list-title">
        <h1>Posts</h1>
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
              <a href={`/posts/${post.id}`}>View comments</a>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

Let's break down what's happening: 
TypeScript props : We're using combined with the generated type to get full type safety. The type is automatically generated from our . 
Mapping posts : We loop through the posts array and display each post's title, author, and URL. 
Type safety : Your editor will autocomplete , , etc., and TypeScript will catch any typos. 

Visit  [link:http://localhost:3333/posts] and you should see a list of all your posts! 
Displaying a single post 
Now let's add the ability to view an individual post with its details. We'll implement the controller method, register the route with a dynamic parameter, and create the React component. 
Implementing the controller method 
Add the method to your controller: 
app/controllers/posts_controller.ts 

```
import Post from '#models/post'
import type { HttpContext } from '@adonisjs/core/http'
import PostTransformer from '#transformers/post_transformer'

export default class PostsController {
  async index({ inertia }: HttpContext) {
    const posts = await Post.query()
      .preload('user')
      .orderBy('createdAt', 'desc')

    return inertia.render('posts/index', {
      posts: PostTransformer.transform(posts),
    })
  }

  async show({ inertia, params }: HttpContext) {
    const post = await Post.query()
      .where('id', params.id)
      .preload('user')
      .firstOrFail()

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### tutorial/react/styling-and-cleanup
Source: https://docs.adonisjs.com/tutorial/react/styling-and-cleanup

Styling and cleanup (FullStack tutorial) - AdonisJS Documentation 

Start
            /
            FullStack tutorial Styling and cleanup 

 [link:/tutorial/hypermedia/styling-and-cleanup] Hypermedia  [link:/tutorial/react/styling-and-cleanup] React 
Styling and Cleanup 
In the previous chapter, we added forms to create posts and comments. We're not done building DevShow yet — there are more features to add — but we've built enough that it's worth pausing to improve the design and user experience. 
Right now, users can't easily navigate between pages, and the design looks bare. Let's fix both by adding proper navigation links and styling everything with CSS. 
Styling the application 
Let's start by adding CSS to make DevShow look polished. The Inertia starter kit already includes a CSS file with some base styles. We'll add DevShow-specific styles to enhance the posts, comments, and overall layout. 
Open your CSS file and add the following styles at the end. 
inertia/css/app.css 

```
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

These styles use CSS variables like and that are already defined in the starter kit's base styles. They provide consistent spacing, typography, and color throughout DevShow. 
Refresh your browser and visit  [link:http://localhost:3333/posts] . You should immediately see improved styling with better spacing, cleaner borders, and more readable typography. 
Updating the homepage 
Right now, the homepage doesn't tell users what DevShow is or how to get started. Let's replace it with a proper landing page that explains the site and links to the posts listing. 
Open the home page component and replace its content: 
inertia/pages/home.tsx 

```
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

We're using the component from 
```
@adonisjs/inertia/react
```
with the prop to reference the named route. The applies styling from the starter kit's CSS. 
Visit the homepage at  [link:http://localhost:3333] and you'll see the new landing page with a clear call-to-action button that takes users to the posts listing. 
Adding a post creation link 
Users who want to share their projects need an easy way to reach the creation form. Let's add a prominent button at the top of the posts listing. 
Update your posts index component to add the button in the header. 
inertia/pages/posts/index.tsx 

```
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

The class uses flexbox (from the CSS we added earlier) to position the heading and button on opposite sides of the header. 
Visit  [link:http://localhost:3333/posts] and you'll see the new "Create new post" button in the top-right corner, making it easy for users to share their projects. 
Adding navigation to the post creation page 
When users are on the post creation form, they might want to go back to browsing posts. Let's add a back link at the top of the page. 
Update your posts create component: 
inertia/pages/posts/create.tsx 

```
import { Form } from '@adonisjs/inertia/react'
import { Link } from '@adonisjs/inertia/react'

export default function PostsCreate() {
  return (
    <div className="form-container">
      <div>
        <Link route="posts.index">
          ‹ Go back to posts listing
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

Visit  [link:http://localhost:3333/posts/create] and you'll see the back link above the heading, making navigation intuitive. 
Adding navigation to the post detail page 
Finally, let's add a back link on individual post pages so users can easily return to the full listing. 
Update your posts show component: 
inertia/pages/posts/show.tsx 

```
import { InertiaProps } f

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
