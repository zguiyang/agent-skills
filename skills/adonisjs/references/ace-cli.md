# Ace Cli — AdonisJS v7

Pinned to official docs: https://docs.adonisjs.com

## Official pages in this section

- [guides/ace/arguments](https://docs.adonisjs.com/guides/ace/arguments)
- [guides/ace/creating-commands](https://docs.adonisjs.com/guides/ace/creating-commands)
- [guides/ace/flags](https://docs.adonisjs.com/guides/ace/flags)
- [guides/ace/introduction](https://docs.adonisjs.com/guides/ace/introduction)
- [guides/ace/prompts](https://docs.adonisjs.com/guides/ace/prompts)
- [guides/ace/repl](https://docs.adonisjs.com/guides/ace/repl)
- [guides/ace/terminal-ui](https://docs.adonisjs.com/guides/ace/terminal-ui)

## Condensed excerpts (prefer live docs if conflict)

### guides/ace/arguments
Source: https://docs.adonisjs.com/guides/ace/arguments

Command arguments (Command line) - AdonisJS Documentation 

line Command arguments 

Command arguments 
This guide covers defining command arguments within custom commands. You will learn about the following topics: 
Defining positional arguments 
Making arguments optional 
Accepting multiple values 
Transforming argument values 
Overview 
Arguments are positional values that users provide after the command name when executing a command. Unlike flags, which can be specified in any order, arguments must be provided in the exact order they are defined in your command class. 
For example, in the command 
```
node ace make:controller users --resource
```
, the word is an argument, while is a flag. Arguments are ideal for required input values that have a natural order, such as filenames, resource names, or entity identifiers. 
Defining your first argument 
You define command arguments as class properties decorated with the decorator. Ace will accept arguments in the same order as they appear in your class, making the property order significant. 
The most common argument type is a string argument, which accepts any text value. Use the decorator to define string arguments. 
commands/greet.ts 

```
import { BaseCommand, args } from '@adonisjs/core/ace'

export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet a user by name'
  
  /**
   * Define a required string argument
   */
  @args.string()
  declare name: string

  async run() {
    this.logger.info(`Hello, ${this.name}!`)
  }
}
```

Users can now run your command by providing a value for the name argument. 

```
node ace greet John

# Output: Hello, John!
```

If the user forgets to provide the required argument, Ace will display an error message indicating which argument is missing. 
Accepting multiple values 
Some commands need to accept multiple values for a single argument. For example, a command that processes multiple files might accept any number of filenames. 
Use the decorator to accept multiple values. The spread argument must be the last argument in your command, as it captures all remaining values. 
commands/greet.ts 

```
import { BaseCommand, args } from '@adonisjs/core/ace'

export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet multiple users by name'
  
  /**
   * Accept multiple names as an array
   */
  @args.spread()
  declare names: string[]

  async run() {
    this.names.forEach((name) => {
      this.logger.info(`Hello, ${name}!`)
    })
  }
}
```

Users can now provide any number of values when running the command. 

```
node ace greet John Jane Bob

# Output:
# Hello, John!
# Hello, Jane!
# Hello, Bob!
```

Customizing argument name and description 
The argument name appears in help screens and error messages. By default, Ace uses the dashed-case version of your property name as the argument name. For example, a property named becomes in the help output. 
You can customize the argument name using the option. 
commands/greet.ts 

```
@args.string({
  argumentName: 'user-name'
})
declare name: string
```

Adding a description helps users understand what value they should provide. The description appears in the help screen when users run 
```
node ace greet --help
```
. 
commands/greet.ts 

```
@args.string({
  argumentName: 'user-name',
  description: 'Name of the user to greet'
})
declare name: string
```

Making arguments optional 
All arguments are required by default, ensuring users provide necessary input before your command executes. However, you can make an argument optional by setting the option to . 
Optional arguments must come after all required arguments. This ordering requirement prevents ambiguity in argument parsing. 
commands/greet.ts 

```
import { BaseCommand, args } from '@adonisjs/core/ace'

export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  
  @args.string({
    description: 'Name of the user to greet'
  })
  declare name: string
  
  /**
   * Optional greeting message with custom wording
   */
  @args.string({
    description: 'Custom greeting message',
    required: false,
  })
  declare message?: string

  async run() {
    const greeting = this.message || 'Hello'
    this.logger.info(`${greeting}, ${this.name}!`)
  }
}
```

Now users can run the command with or without the second argument. 

```
node ace greet John
# Output: Hello, John!

node ace greet John "Good morning"
# Output: Good morning, John!
```

Providing default values 
You can specify a default value for optional arguments using the property. When users don't provide a value, Ace uses the default instead. 
commands/greet.ts 

```
@args.string({
  description: 'Name of the user to greet',
  required: false,
  default: 'guest'
})
declare name: string
```

With a default value, the argument becomes optional but your code can always expect a string value rather than handling undefined. 

```
node ace greet
# Uses the default value "guest"
# Output: Hello, guest!
```

Transforming argument values 
The method allows you to transform or validate the argument value before it's assigned to the class property. This is useful for normalizing input, converting types, or performing validation. 
The parse method receives the raw string value from the command line and must return the transformed value. 
commands/greet.ts 

```
@args.string({
  argumentName: 'user-name',
  description: 'Name of the user to greet',
  parse(value) {
    /**
     * Convert the name to uppercase
     */
    return value ? value.toUpperCase() : value
  }
})
declare name: string
```

Now when users provide a name, it will automatically be converted to uppercase before your command's method executes. 

```
node ace greet john
# The name is transformed to "JOHN"
# Output: Hello, JOHN!
```

You can also use the parse method for validation by throwing an error when the value is invalid. 
commands/create_user.ts 

```
@args.string({
  description: 'Email address of the user',
  parse(value) {
    if (!value.includes('@')) {
      throw new Error('Please provide a valid email address')
    }
    return value.toLowerCase()
  }
})
declare email: string
```

Accessing all arguments 
You can access all arguments provided by the user, including their raw values, using the property. This is useful for debugging or when you need to inspect the complete argument list. 
commands/greet.ts 

```
import { BaseCommand, args } from '@adonisjs/core/ace'

export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet a user by name'
  
  @args.string()
  declare name: string

  async run() {
    /**
     * Access all arguments as a key-value object
     */
    console.log(this.parsed.args)
    // Output: { name: 'John' }
    
    this.logger.info(`Hello, ${this.name}!`)
  }
}
```

 [link:/guides/ace/creating-commands] Previous  [link:/guides/ace/flags] Comm

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/ace/creating-commands
Source: https://docs.adonisjs.com/guides/ace/creating-commands

Creating commands (Command line) - AdonisJS Documentation 

line Creating commands 

Creating commands 
This guide covers creating commands using the Ace command line. You will learn about the following topics: 
Creating custom commands 
Configuring command metadata 
Using lifecycle methods 
Injecting dependencies 
Handling errors 
Managing long-running processes 
Creating your first command 
You can generate a new command using the Ace command. This creates a basic command (within the directory) scaffolded with all the necessary boilerplate. 
See also:  [link:/reference/commands] Make command 

```
node ace make:command greet

# CREATE: commands/greet.ts
```

The generated file contains a command class that extends . At minimum, a command must define a and implement the method. 
commands/greet.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'

export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet a user by name'

  async run() {
    this.logger.info('Hello world!')
  }
}
```

You can now execute your command using the command name you defined. 

Configuring command metadata 
Command metadata controls how your command appears in help screens and how it behaves during execution. The metadata includes the command name, description, help text, aliases, and execution options. 
Setting the command name 
The property defines the name users will type to execute your command. Command names should not contain spaces and should avoid unfamiliar special characters like , , or slashes. 
commands/greet.ts 

```
export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
}
```

Command names can include namespaces by using a colon separator. This helps organize related commands together in the help output. 
commands/make/controller.ts 

```
export default class MakeControllerCommand extends BaseCommand {
  /**
   * The command appears under the "make" namespace
   */
  static commandName = 'make:controller'
}
```

Writing command descriptions 
The command description appears in the commands list and on the help screen for your command. Keep descriptions concise and use the help text for longer explanations. 
commands/greet.ts 

```
export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet a user by name'
}
```

Adding detailed help text 
Help text allows you to provide longer descriptions, usage examples, or additional context that doesn't fit in the brief description. Define help text as an array of strings, where each string represents a line of output. 
commands/greet.ts 

```
export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  static description = 'Greet a user by name'
  
  static help = [
    'The greet command is used to greet a user by name',
    '',
    'You can also send flowers to a user, if they have an updated address',
    '{{ binaryName }} greet --send-flowers',
  ]
}
```

The variable substitution references the binary used to execute ace commands (typically ), ensuring your help text displays the correct command syntax regardless of how the user runs Ace. 
Defining command aliases 
Aliases provide alternative names for your command. This is useful when you want to offer shorter or more intuitive names for frequently used commands. 
commands/greet.ts 

```
export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  static aliases = ['welcome', 'sayhi']
}
```

Users can now run your command using any of the defined names. 

```
node ace greet
node ace welcome  
node ace sayhi
```

Configuring command options 
Command options control the execution behavior of your command. These options are defined using the static property and affect how Ace boots the application, handles flags, and manages the command's lifecycle. 
commands/greet.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class GreetCommand extends BaseCommand {
  static commandName = 'greet'
  
  static options: CommandOptions = {
    startApp: false,
    allowUnknownFlags: false,
    staysAlive: false,
  }
}
```

Starting the application 
By default, Ace does not boot your AdonisJS application when running commands. This keeps commands fast and prevents unnecessary application initialization for simple tasks that don't need application state. 
However, if your command needs access to models, services, or other application resources, you must tell Ace to start the app before executing the command. 
commands/send_email.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class SendEmailCommand extends BaseCommand {
  static options: CommandOptions = {
    /**
     * Start the app to access models and services
     */
    startApp: true
  }
  
  async run() {
    /**
     * Can now use application resources like models
     */
    const users = await User.all()
  }
}
```

Allowing unknown flags 
By default, Ace will display an error if you pass a flag that the command doesn't define. This strict parsing helps catch typos and incorrect flag usage. 
However, some commands need to accept arbitrary flags and pass them to other tools. You can disable strict flag parsing using the option. 
commands/proxy.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class ProxyCommand extends BaseCommand {
  static options: CommandOptions = {
    /**
     * Accept any flags and pass them to external tools
     */
    allowUnknownFlags: true
  }
}
```

Creating long-running commands 
Ace automatically terminates the application after your command's method completes. This is the desired behavior for most commands that perform a task and exit. 
However, if your command needs to run indefinitely (like a queue worker or development server), you must tell Ace not to terminate the application using the option. 
commands/queue_worker.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class QueueWorkerCommand extends BaseCommand {
  static options: CommandOptions = {
    startApp: true,
    /**
     * Keep the process alive
     */
    staysAlive: true
  }
  
  async run() {
    /**
     * Start processing jobs indefinitely
     */
    await this.startJobProcessor()
  }
}
```

See also: Terminating the application and Cleaning up before termination 
Understanding command lifecycle 
Ace executes command lifecycle methods in a predefined order, allowing you to organize your command logic into distinct phases. Each lifecycle method serves a specific purpose in the command execution flow. 
commands/greet.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'

export default class Gr

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/ace/flags
Source: https://docs.adonisjs.com/guides/ace/flags

Command flags (Command line) - AdonisJS Documentation 

line Command flags 

Command flags 
This guide covers defining command flags within custom commands. You will learn about the following topics: 
Defining boolean, string, number, and array flags 
Customizing flag names and descriptions 
Creating flag aliases for shorthand usage 
Setting default values for flags 
Transforming and validating flag values 
Accessing all provided flags 
Overview 
Flags provide a way to accept optional or named parameters without requiring a specific order. They are specified with either two hyphens ( ) for full names or a single hyphen ( ) for aliases. 
In the following command, both and are flags. 

```
node ace make:controller users --resource --singular
```

Unlike positional arguments, flags can appear anywhere in the command and can be omitted entirely if they're optional. This makes flags ideal for options that customize command behavior, such as enabling features, specifying output formats, or providing configuration values. 
Ace supports multiple flag types including boolean flags for on/off options, string flags for text values, number flags for numeric input, and array flags for multiple values. 
Defining boolean flags 
Boolean flags represent on/off or yes/no options. They are the simplest flag type and don't require a value - simply mentioning the flag sets it to . 
Use the decorator to define a boolean flag. 
commands/make_controller.ts 

```
import { BaseCommand, flags } from '@adonisjs/core/ace'

export default class MakeControllerCommand extends BaseCommand {
  static commandName = 'make:controller'
  
  /**
   * Enable resource controller generation
   */
  @flags.boolean()
  declare resource: boolean

  /**
   * Create a singular resource controller
   */
  @flags.boolean()
  declare singular: boolean
  
  async run() {
    if (this.resource) {
      this.logger.info('Creating a resource controller')
    }
  }
}
```

When users mention the flag, its value becomes . If they omit the flag, its value is . 

```
node ace make:controller users --resource
# this.resource === true

node ace make:controller users
# this.resource === undefined
```

Negating boolean flags 
Boolean flags support negation using the prefix, allowing users to explicitly set a flag to . This is useful when a flag has a default value of and users need to disable it. 

```
node ace make:controller users --no-resource
# this.resource === false
```

By default, the negated variant is not shown in help screens to keep output concise. You can display it using the 
```
showNegatedVariantInHelp
```
option. 
commands/make_controller.ts 

```
@flags.boolean({
  showNegatedVariantInHelp: true,
})
declare resource: boolean
```

Defining string flags 
String flags accept text values that users provide after the flag name. Use the decorator to define string flags. 
commands/make_controller.ts 

```
import { BaseCommand, flags } from '@adonisjs/core/ace'

export default class MakeControllerCommand extends BaseCommand {
  static commandName = 'make:controller'
  
  /**
   * The model name to associate with the controller
   */
  @flags.string()
  declare model: string
  
  async run() {
    if (this.model) {
      this.logger.info(`Creating controller for ${this.model} model`)
    }
  }
}
```

Users provide the value after the flag name, separated by a space or equals sign. 

```
node ace make:controller users --model user
# this.model = 'user'

node ace make:controller users --model=user
# this.model = 'user'
```

If the flag value contains spaces or special characters, users must wrap it in quotes. 

```
node ace make:controller posts --model blog user
# this.model = 'blog'
# (only takes the first word)

node ace make:controller posts --model "blog user"
# this.model = 'blog user'
# (captures the full phrase)
```

Ace will display an error if users mention the flag but don't provide a value, even when the flag is optional. 

```
node ace make:controller users
# Works - optional flag is not mentioned

node ace make:controller users --model
# Error: Missing value for flag --model
```

Defining number flags 
Number flags are similar to string flags but Ace validates that the provided value is a valid number. This ensures your command receives numeric input rather than arbitrary text. 
Use the decorator to define number flags. 
commands/create_user.ts 

```
import { BaseCommand, flags } from '@adonisjs/core/ace'

export default class CreateUserCommand extends BaseCommand {
  static commandName = 'create:user'
  
  /**
   * Initial score for the new user
   */
  @flags.number()
  declare score: number
  
  async run() {
    this.logger.info(`Creating user with score: ${this.score}`)
  }
}
```

Users must provide a valid numeric value. 

```
node ace create:user --score 100
# this.score = 100

node ace create:user --score abc
# Error: Flag --score must be a valid number
```

Defining array flags 
Array flags allow users to specify the same flag multiple times, collecting all values into an array. This is useful when a command needs to accept multiple items of the same type, such as file paths, tags, or permission groups. 
Use the decorator to define array flags. 
commands/create_user.ts 

```
import { BaseCommand, flags } from '@adonisjs/core/ace'

export default class CreateUserCommand extends BaseCommand {
  static commandName = 'create:user'
  
  /**
   * Groups to assign to the user
   */
  @flags.array()
  declare groups: string[]
  
  async run() {
    this.logger.info(`Assigning user to groups: ${this.groups.join(', ')}`)
  }
}
```

Users can specify the flag multiple times to build up the array. 

```
node ace create:user --groups=admin --groups=moderators --groups=creators
# this.groups = ['admin', 'moderators', 'creators']
```

Customizing flag names and descriptions 
By default, Ace converts your property name to dashed-case for the flag name. For example, a property named becomes . You can customize this using the option. 
commands/serve.ts 

```
@flags.boolean({
  flagName: 'server'
})
declare startServer: boolean
```

Adding a description helps users understand the flag's purpose. The description appears in help screens when users run your command with the flag. 
commands/serve.ts 

```
@flags.boolean({
  flagName: 'server',
  description: 'Start the application server after the build'
})
declare startServer: boolean
```

Creating flag aliases 
Flag aliases provide shorthand names for flags, making commands faster to type for frequently used options. Aliases use a single hyphen ( ) and must be a single character. 
commands/make_controller.ts 

```
@flags.boolean({
  alias: 'r',
  description: 'Generate a resource controller'
})
declare resource: boolean

@flags.boolean({
  alias: 's',
  description: 'Create a singular resource controller'
})
declare singular: boolean
```

Users can use either the full flag name or the alias. 

```
node ace make:controller users --resource --singular
# Same as
node ace ma

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/ace/introduction
Source: https://docs.adonisjs.com/guides/ace/introduction

Introduction (Command line) - AdonisJS Documentation 

line Introduction 

Ace Command line 
This guide introduces you to the Ace command line. You will learn about the following topics: 
Running Ace commands 
Viewing help documentation 
Creating command aliases 
Running commands programmatically 
Overview 
Ace is AdonisJS's command line framework that powers all console commands in your application. Whether you're running database migrations, creating controllers, or building custom CLI tools, Ace provides the foundation for all command line interactions. 
The framework handles command parsing, argument validation, interactive prompts, and terminal output formatting, allowing you to focus on building command logic rather than dealing with CLI boilerplate. Every AdonisJS application includes Ace by default, accessible through the entry point file in your project root. 
Understanding how to use Ace effectively is essential for AdonisJS development, as you'll interact with it constantly during development and deployment. 
Running Ace commands 
You can execute Ace commands using the file located in your project root. This file serves as the entry point for all command line operations. 
Warning 
Do not modify the file directly. If you need to add custom code that runs before Ace starts, put it in the file instead. 

```
node ace
node ace make:controller
node ace migration:run
```

Viewing available commands 
To see a list of all available commands in your application, run the ace entry point without any arguments or use the command explicitly. 

```
node ace

# Same as above
node ace list
```

Both commands display the same help screen, showing all registered commands organized by category. 

Note 
The help output follows the  [link:http://docopt.org/] docopt standard, a specification for command line interfaces that ensures consistent documentation formatting across different tools. 

Getting help for specific commands 
Every Ace command includes built-in help documentation. To view detailed information about a specific command, including its arguments, flags, and usage examples, append the flag to any command. 

```
node ace make:controller --help
```

The help screen shows the command's description, required and optional arguments, available flags with their descriptions, and usage examples. 
Controlling color output 
Ace automatically detects your terminal environment and disables colorful output when the terminal doesn't support ANSI colors. However, you can manually control color output using the flag. 

```
# Disable colors
node ace list --no-ansi

# Force enable colors
node ace list --ansi
```

Disabling colors is useful when redirecting command output to files or when running commands in CI/CD environments that don't support colored terminal output. 
Creating command aliases 
Command aliases provide shortcuts for frequently used commands with specific flag combinations. This is particularly useful when you find yourself repeatedly typing the same command with the same flags. 
You can define aliases in the file using the object. Each alias maps a short name to a complete command with its flags. 
adonisrc.ts 

```
export default defineConfig({
  commandsAliases: {
    /**
     * Create a singular resourceful controller
     */
    resource: 'make:controller --resource --singular'
  }
})
```

Once defined, you can use the alias name instead of typing the full command. Any additional arguments you provide are appended to the expanded command. 

```
# Using the alias
node ace resource users

# Expands to
node ace make:controller --resource --singular users
```

How alias expansion works 
When you run a command, Ace follows this expansion process: 
Ace checks if the command name matches any alias in the object 
If a match is found, Ace extracts the first word from the alias value (before any spaces) and looks up the corresponding command 
If a command exists with that name, Ace appends all remaining segments from the alias value to form the complete command 
Finally, Ace appends any arguments or flags you provided when running the alias 
For example, if you run: 

```
node ace resource admin --help
```

Ace expands this to: 

```
node ace make:controller --resource --singular admin --help
```

The expansion preserves argument order and allows you to add additional flags beyond those defined in the alias. 
Running commands programmatically 
You can execute Ace commands from within your application code using the service. This is useful for building workflows that need to trigger commands programmatically, such as running migrations during application setup or generating files based on user actions. 
The service is available after your application has been booted, ensuring all necessary services and providers are loaded before command execution. 

```
import ace from '@adonisjs/core/services/ace'

/**
 * Execute a command and get its result
 */
const command = await ace.exec('make:controller', [
  'users',
  '--resource',
])

/**
 * The command object contains execution details
 */
console.log(command.exitCode) // 0 for success, 1 for failure
console.log(command.result)   // Command return value
console.log(command.error)    // Error object if command failed
```

Before executing commands, you should verify that the command exists to avoid runtime errors. Use the method to check command availability. 

```
import ace from '@adonisjs/core/services/ace'

/**
 * Boot Ace to load all registered commands
 * (if not already loaded)
 */
await ace.boot()

if (ace.hasCommand('make:controller')) {
  await ace.exec('make:controller', [
    'users',
    '--resource',
  ])
} else {
  console.log('Controller command not available')
}
```

The method loads all commands if they haven't been loaded already. This ensures the check works correctly by verifying against the complete command registry. 

 [link:/guides/digging-deeper/opentelemetry] Previous  [link:/guides/ace/creating-commands] Creating commands Learn how to create custom Ace commands in AdonisJS 

Next

---

### guides/ace/prompts
Source: https://docs.adonisjs.com/guides/ace/prompts

Prompts (Command line) - AdonisJS Documentation 

line Prompts 

Prompts 
This guide covers using prompts within custom commands. You will learn about the following topics: 
Displaying text and password input prompts 
Creating single and multi-select choice lists 
Using confirmation and toggle prompts 
Validating and transforming user input 
Using autocomplete for searchable lists 
Testing commands with prompts 
Overview 
Prompts enable interactive command line experiences by allowing users to provide input through intuitive terminal widgets rather than command line arguments or flags. This is particularly useful for commands that need to guide users through multi-step processes, collect sensitive information like passwords, or allow selection from a list of options. 
Ace prompts are powered by the  [link:https://github.com/poppinss/prompts] @poppinss/prompts package, which supports multiple prompt types including text input, password fields, confirmations, single and multi-select lists, and autocomplete searches. All prompts support validation, default values, and transformation of user input before it's returned to your command. 
A key feature of Ace prompts is their  [link:/guides/testing/console-tests] testing support . When writing tests, you can trap prompts and respond to them programmatically, making it easy to test interactive commands without manual input. 
Displaying text input 
The text input prompt accepts free-form text from users. Use the method to display a text input prompt, providing the prompt message as the first parameter. 
commands/make_model.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'

export default class MakeModelCommand extends BaseCommand {
  static commandName = 'make:model'
  
  async run() {
    /**
     * Ask for the model name
     */
    const modelName = await this.prompt.ask('Enter the model name')
    
    this.logger.info(`Creating model: ${modelName}`)
  }
}
```

Adding validation 
You can validate user input by providing a function in the options object. The function receives the user's input and should return to accept the value, or an error message string to reject it. 
commands/make_model.ts 

```
const modelName = await this.prompt.ask('Enter the model name', {
  validate(value) {
    return value.length > 0
      ? true
      : 'Model name is required'
  }
})
```

If validation fails, the prompt displays the error message and asks for input again until the user provides a valid value. 
Providing default values 
Default values appear as suggestions that users can accept by pressing Enter. This is useful for providing common values or sensible defaults. 
commands/make_model.ts 

```
const modelName = await this.prompt.ask('Enter the model name', {
  default: 'User'
})
```

Collecting passwords 
The password prompt masks user input in the terminal, replacing each character with an asterisk or bullet point. This is essential for collecting sensitive information like passwords, API keys, or tokens. 
Use the method to display a password prompt. 
commands/setup.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'

export default class SetupCommand extends BaseCommand {
  static commandName = 'setup'
  
  async run() {
    /**
     * Collect the database password securely
     */
    const password = await this.prompt.secure('Enter database password')
    
    this.logger.info('Password collected securely')
  }
}
```

You can add validation to password prompts just like text inputs. 
commands/setup.ts 

```
const password = await this.prompt.secure('Enter account password', {
  validate(value) {
    return value.length >= 8
      ? true
      : 'Password must be at least 8 characters long'
  }
})
```

Creating choice lists 
The choice prompt displays a list of options that users can navigate with arrow keys and select with Enter. This is ideal when you need users to pick from predefined options. 
Use the method to display a single-select list. The method accepts the prompt message as the first parameter and an array of choices as the second parameter. 
commands/configure.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'

export default class ConfigureCommand extends BaseCommand {
  static commandName = 'configure'
  
  async run() {
    /**
     * Let the user select their package manager
     */
    const packageManager = await this.prompt.choice('Select package manager', [
      'npm',
      'yarn',
      'pnpm'
    ])
    
    this.logger.info(`Using ${packageManager}`)
  }
}
```

Customizing choice display 
When you want the displayed text to differ from the returned value, define choices as objects with and properties. The is what your command receives, while the is what users see. 
commands/configure.ts 

```
const driver = await this.prompt.choice('Select database driver', [
  {
    name: 'sqlite',
    message: 'SQLite'
  },
  {
    name: 'mysql',
    message: 'MySQL'
  },
  {
    name: 'pg',
    message: 'PostgreSQL'
  }
])

this.logger.info(`Selected driver: ${driver}`)
// If user selected "PostgreSQL", driver will be "pg"
```

Allowing multiple selections 
The multi-select prompt lets users select multiple options from a list using the spacebar to toggle selections. This is useful when users need to choose multiple features, packages, or configurations. 
Use the method to display a multi-select list. The parameters are the same as the choice prompt. 
commands/install.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'

export default class InstallCommand extends BaseCommand {
  static commandName = 'install:packages'
  
  async run() {
    /**
     * Let users select multiple database drivers
     */
    const drivers = await this.prompt.multiple('Select database drivers', [
      {
        name: 'sqlite',
        message: 'SQLite'
      },
      {
        name: 'mysql',
        message: 'MySQL'
      },
      {
        name: 'pg',
        message: 'PostgreSQL'
      }
    ])
    
    this.logger.info(`Installing drivers: ${drivers.join(', ')}`)
  }
}
```

The method returns an array of selected values. Users can select all, some, or none of the options. 
Confirming actions 
Confirmation prompts ask users to answer yes or no questions. They're essential for destructive operations or actions that need explicit user consent. 
Use the method to display a yes/no confirmation. The method returns a boolean value. 
commands/reset.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'

export default class ResetCommand extends BaseCommand {
  static commandName = 'db:reset'
  
  async run() {
    /**
     * Confirm before deleting data
     */
    const shouldDelete = await this.prompt.confirm(
      'Want to delete all files?'
    )
    
    if (shouldDelete) {
      this.logger.warning('Deleting all files...')
      // Perform deletion
    } else {
      this.logger.info('Operation cancelled')
    }
  }
}
```

Customizing yes/no labels 
If you want to customize the yes/no labels to something m

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/ace/repl
Source: https://docs.adonisjs.com/guides/ace/repl

Repl (Command line) - AdonisJS Documentation 

line Repl 

REPL 
In this guide, you will learn about the following topics: 
Starting and navigating the REPL session 
Importing modules and accessing services 
Using built-in helper methods 
Accessing command history and results 
Adding custom REPL methods 
Working with the editor mode 
Overview 
The AdonisJS REPL extends the standard  [link:https://nodejs.org/api/repl.html] Node.js REPL with application-aware features that make it easy to interact with your codebase. Unlike the basic Node.js REPL, the AdonisJS REPL boots your application, loads its services, and provides convenient shortcuts for common tasks. 
The REPL is particularly useful during development for quick experimentation, debugging, and data exploration. You can import TypeScript files directly, access container services without manual imports, create class instances through the IoC container, and extend the REPL with custom methods specific to your application. 
Starting the REPL session 
You can start the REPL session using the command. This boots your AdonisJS application and opens an interactive prompt where you can execute code. 

Once started, you'll see a prompt where you can type JavaScript code and press Enter to execute it. The output appears immediately on the following line, creating a fast feedback loop for testing and exploration. 
Using editor mode 
While the REPL is great for single-line expressions, you sometimes need to write multi-line code blocks. The editor mode allows you to write multiple lines of code before executing them. 
Enter editor mode by typing the command at the REPL prompt. 

```
> (js) .editor
# // Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)
```

In editor mode, you can write multiple lines of code. Press to execute the entire code block, or press to cancel and exit editor mode without executing anything. 

```
> (js) .editor

# // Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)
const users = await User.query()
  .where('isActive', true)
  .orderBy('createdAt', 'desc')
  .limit(10)

console.log(`Found ${users.length} active users`)
# // Press Ctrl+D to execute
```

Accessing previous results 
The REPL provides special variables for accessing results and errors from previously executed commands, eliminating the need to re-run code when you forget to store a value. 
Accessing the last result 
If you execute a statement but forget to assign its result to a variable, you can access it using the (underscore) variable. 

```
> (js) helpers.string.random(32)
# 'Z3y8QQ4HFpYSc39O2UiazwPeKYdydZ6M'

> (js) _
# 'Z3y8QQ4HFpYSc39O2UiazwPeKYdydZ6M'

> (js) _.length
# 32
```

This is particularly useful when you want to perform additional operations on a result without re-executing the original command. 
Accessing the last error 
Similarly, you can access any exception raised by the previous command using the variable. This is helpful for inspecting error details without cluttering your code with try/catch blocks. 

```
> (js) helpers.string.random()
# Error: The value of "size" is out of range...

> (js) _error.message
# 'The value of "size" is out of range. It must be >= 0 && <= 2147483647. Received NaN'

> (js) _error.stack
# (full error stack trace)
```

Navigating command history 
The REPL maintains a history of all commands you've executed, saved in the 
```
.adonisjs_v7_repl_history
```
file in your home directory. This allows you to recall and re-execute previous commands without retyping them. 
You can navigate through command history in two ways: 
Arrow key navigation : Press the up arrow key to cycle through previous commands one at a time. Press the down arrow to move forward through the history. 

Search mode : Press to enter reverse search mode, then type characters to search for matching commands in your history. Press again to cycle through multiple matches. 

```
> (js) [Press Ctrl+R]
(reverse-i-search)`query': const users = await User.query()
```

Exiting the REPL session 
You can exit the REPL session either by typing or by pressing twice in quick succession to exit. 

```
> (js) .exit
# Goodbye!
```

When you exit, AdonisJS performs a graceful shutdown, closing database connections and cleaning up resources before the process terminates. 
Note that the REPL session does not automatically reload when you modify your codebase. If you change your application code, you must exit and restart the REPL session for the changes to take effect. 
Importing modules 
Node.js does not support statements in REPL sessions, so you must use dynamic expressions instead. When importing, you need to destructure the module exports or access specific properties. 

```
> (js) const { default: User } = await import('#models/user')
# undefined

> (js) await User.all()
# [User, User, User, ...]
```

The syntax 
```
const { default: User }
```
destructures the default export from the module. This can be verbose when you only want the default export. 
Using the importDefault helper 
To simplify importing default exports, the REPL provides an helper method that automatically extracts the default export. 

```
> (js) const User = await importDefault('#models/user')
# undefined

> (js) const Post = await importDefault('#models/post')
# undefined

> (js) await Post.query().where('published', true)
# [Post, Post, Post, ...]
```

This is particularly convenient when working with models, services, or any modules that export a single default value. 
Using helper methods 
The REPL includes several built-in helper methods that provide shortcuts for common tasks like importing services, making class instances, and managing the REPL context. 
You can view all available helper methods by typing the command. 

```
> (js) .ls

# GLOBAL METHODS:
importDefault         Returns the default export for a module
make                  Make class instance using "container.make" method
loadApp               Load "app" service in the REPL context
loadEncryption        Load "encryption" service in the REPL context
loadHash              Load "hash" service in the REPL context
loadRouter            Load "router" service in the REPL context
loadConfig            Load "config" service in the REPL context
loadTestUtils         Load "testUtils" service in the REPL context
loadHelpers           Load "helpers" module in the REPL context
clear                 Clear a property from the REPL context
p                     Promisify a function. Similar to Node.js "util.promisify"
```

Loading services 
Instead of manually importing services, you can use the helper methods to load them into the REPL context. 

```
> (js) await loadRouter()
# Imported router. You can access it using the "router" property

> (js) router.toJSON()
# { routes: [...], ... }

> (js) await loadHash()
# Imported hash. You can access it using the "hash" property

> (js) await hash.make('secret')
# '$argon2id$v=19$m=65536,t=3,p=4$...'
```

Each method imports the corresponding service and 

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---

### guides/ace/terminal-ui
Source: https://docs.adonisjs.com/guides/ace/terminal-ui

Terminal UI (Command line) - AdonisJS Documentation 

line Terminal UI 

Terminal UI 
This guide covers different aspects of Terminal UIs. You will learn about the following topics: 
Displaying log messages with different severity levels 
Adding loading animations and action indicators 
Formatting text with colors 
Rendering tables with custom alignment 
Creating boxed content with stickers 
Building animated task runners with progress updates 
Overview 
The Ace terminal UI is powered by the  [link:https://github.com/poppinss/cliui] @poppinss/cliui package, which provides helpers for displaying logs, rendering tables, showing animated tasks, and more. 
All terminal UI primitives are built with testing in mind. When writing tests, you can enable "raw" mode to disable colors and formatting, making it easy to collect logs in memory and write assertions against them. This design ensures your commands remain testable while delivering rich visual experiences to users. 
Displaying log messages 
The CLI logger provides methods for displaying messages at different severity levels. Each log level uses distinct colors and icons to help users quickly identify message importance. 
commands/deploy.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'

export default class DeployCommand extends BaseCommand {
  static commandName = 'deploy'
  
  async run() {
    /**
     * Debug message - helpful for troubleshooting
     */
    this.logger.debug('Loading deployment configuration')
    
    /**
     * Info message - general information
     */
    this.logger.info('Deploying application to production')
    
    /**
     * Success message - operation completed successfully
     */
    this.logger.success('Deployment completed successfully')
    
    /**
     * Warning message - potential issues
     */
    this.logger.warning('SSL certificate expires in 30 days')
    
    /**
     * Error and fatal messages - written to stderr
     */
    this.logger.error(new Error('Failed to upload assets'))
    this.logger.fatal(new Error('Deployment failed completely'))
  }
}
```

The and methods write to stderr rather than stdout, making it easier for users to redirect error output separately from normal output. 
Adding prefix and suffix 
You can add prefix and suffix text to log messages for additional context. Both prefix and suffix are displayed with reduced opacity to distinguish them from the main message. 
commands/install.ts 

```
/**
 * Add a suffix showing the command being run
 */
this.logger.info('Installing packages', {
  suffix: 'npm i --production'
})

/**
 * Add a prefix showing the process ID
 */
this.logger.info('Starting worker', {
  prefix: process.pid
})
```

Creating loading animations 
Loading animations display animated dots after a message, providing visual feedback during long-running operations. You can update the message text and stop the animation when the operation completes. 
commands/build.ts 

```
/**
 * Create a loading animation
 */
const animation = this.logger.await('Installing packages', {
  suffix: 'npm i'
})

/**
 * Start the animation
 */
animation.start()

/**
 * Update the message as progress continues
 */
setTimeout(() => {
  animation.update('Unpacking packages', {
    suffix: undefined
  })
}, 2000)

/**
 * Stop the animation when complete
 */
setTimeout(() => {
  animation.stop()
  this.logger.success('Installation complete')
}, 4000)
```

Displaying action status 
Logger actions provide a consistent way to display the status of operations with automatic styling and color coding. This is particularly useful when performing multiple sequential tasks. 
commands/setup.ts 

```
/**
 * Create an action indicator
 */
const createFile = this.logger.action('creating config/auth.ts')

try {
  await this.createConfigFile()
  
  /**
   * Mark the action as succeeded
   * Optional: display how long it took
   */
  createFile.displayDuration().succeeded()
} catch (error) {
  /**
   * Mark the action as failed with the error
   */
  createFile.failed(error)
}
```

Actions can be marked with three different states: 
commands/setup.ts 

```
/**
 * Operation completed successfully
 */
action.succeeded()

/**
 * Operation was skipped with a reason
 */
action.skipped('File already exists')

/**
 * Operation failed with an error
 */
action.failed(new Error('Permission denied'))
```

Formatting text with colors 
Ace uses  [link:https://www.npmjs.com/package/kleur] kleur for applying ANSI color codes to text. Access kleur's chained API through the property to format text with foreground colors, background colors, and text styles. 
commands/status.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'

export default class StatusCommand extends BaseCommand {
  static commandName = 'status'
  
  async run() {
    /**
     * Apply foreground colors
     */
    this.logger.info(this.colors.red('[ERROR]'))
    this.logger.info(this.colors.green('[SUCCESS]'))
    this.logger.info(this.colors.yellow('[WARNING]'))
    
    /**
     * Combine background and foreground colors
     */
    this.logger.info(this.colors.bgGreen().white(' CREATED '))
    this.logger.info(this.colors.bgRed().white(' FAILED '))
    
    /**
     * Apply text styles
     */
    this.logger.info(this.colors.bold('Important message'))
    this.logger.info(this.colors.dim('Less important details'))
  }
}
```

Rendering tables 
Tables organize data into rows and columns, making it easy for users to scan and compare information. Create a table using the method, which returns a instance for defining headers and rows. 
commands/list_migrations.ts 

```
import { BaseCommand } from '@adonisjs/core/ace'

export default class ListMigrationsCommand extends BaseCommand {
  static commandName = 'migration:list'
  
  async run() {
    /**
     * Create a new table
     */
    const table = this.ui.table()
    
    /**
     * Define table headers
     */
    table.head([
      'Migration',
      'Duration',
      'Status',
    ])
    
    /**
     * Add table rows
     */
    table.row([
      '1590591892626_tenants.ts',
      '2ms',
      'DONE'
    ])
    
    table.row([
      '1590595949171_entities.ts',
      '2ms',
      'DONE'
    ])
    
    /**
     * Render the table to the terminal
     */
    table.render()
  }
}
```

You can apply color formatting to any table cell by wrapping values with color methods. 
commands/list_migrations.ts 

```
table.row([
  '1590595949171_entities.ts',
  '2ms',
  this.colors.green('DONE')
])

table.row([
  '1590595949172_users.ts',
  '5ms',
  this.colors.red('FAILED')
])
```

Right-aligning columns 
By default, all columns are left-aligned. You can right-align columns by defining them as objects with an property. When right-aligning a column, make sure to also right-align the corresponding header. 
commands/list_migrations.ts 

```
/**
 * Right-align the status column header
 */
table.head([
  'Migration',
  'Batch',
  {
    content: 'Status',
    hAlign: 'right'
  },
])

/**

… [truncated — use lookup_docs.py or open the Source URL for full detail]


---
