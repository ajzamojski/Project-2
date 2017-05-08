# sequelize-registry

A helper for setting up Sequelize models and their associations while avoiding issues with circular dependencies.

# Install

```
npm install --save sequelize-registry
```

# Usage

Create a models folder and a model definition file. The directory name may be anything you choose.

```
$ mkdir my_entity_definitions
$ vim my_entity_definitions/blog_post.js
```

Example:

### `blog_post.js`

```
var Sequelize = require('sequelize');

module.exports = {
  name: 'blog_post',
  cols: {
    title: Sequelize.STRING
  },
  refs: [
    // see API docs below ...
  ],
  opts: {
    // see API docs below ...
  }
};
```

Initialize the registry by pointing the init function to your models directory as indicated in the API documentation below. The absolute path to your model definitions folder must be provided. Then proceed to use sequelize as you would normally.

Example:

### `app.js`

```
var Sequelize = require('sequelize');
var defineModels = require('sequelize-registry').defineModels;

var sequelize = new Sequelize(...);
defineModels(sequelize, '/home/johndoe/myproject/my_entity_definitions');

// after running the defineModels function, you may then
// retrieve any model from the sequelize instance as usual
var BlogPost = sequelize.model('blog_post');

// the retrieved model should automatically have any
// defined associations available for use as would
// be expected by defining the associations manually
BlogPost.findById(3).then(function(post) {
  var comments = post.getComments();
  // ...
});
```

## Example

Here is an example of a simple blog.

### `models/post.js`

```
var Sequelize = require('sequelize');

module.exports = {
  // this will define a model with sequelize.define('blog_post', ...)
  name: 'blog_post',

  cols: {
    title: Sequelize.STRING,
    body: Sequelize.TEXT,
    author: Sequelize.STRING
  },

  refs: [
    {
      type: 'hasMany',
      model: 'post_comment'
    }
  ],

  opts: {
    underscored: true,
    freezeTableName: true
  }
};
```

### `models/comment.js`

```
var Sequelize = require('sequelize');

module.exports = {
  // this will define a model with sequelize.define('post_comment', ...)
  name: 'post_comment',

  cols: {
    post_id: Sequelize.INTEGER,
    body: Sequelize.TEXT,
    author: Sequelize.STRING
  },

  refs: [
    {
      type: 'belongsTo',
      model: 'blog_post',

      // The config property is optional, but may be specified if extra
      // configuration options are desired. Valid properties of the config
      // object are any options valid for that Sequelize association type.
      config: {
        foreignKey: 'post_id',
        targetKey: 'id'
      }
    }
  ],

  opts: {
    underscored: true,
    freezeTableName: true
  }
};
```

### Results

The above model definition files, when used with this package, will result in the equivalent of:

```
sequelize.define('blog_post', {
  title: Sequelize.STRING,
  body: Sequelize.TEXT,
  author: Sequelize.STRING
}, {
  underscored: true,
  freezeTableName: true
});

sequelize.define('post_comment', {
  title: Sequelize.STRING,
  body: Sequelize.TEXT,
  author: Sequelize.STRING
}, {
  underscored: true,
  freezeTableName: true
});

sequelize.model('blog_post').hasMany(sequelize.model('post_comment'));
sequelize.model('post_comment').belongsTo(sequelize.model('blog_post'), {
  foreignKey: 'post_id',
  targetKey: 'id'
});
```

# API

## Init Method

The initialization method is called `defineModels`.

```
defineModels(sequelizeInstance, modelsDirectoryPath);

  @param sequelizeInstance Object REQUIRED An instance of Sequelize instantiated with `new` e.g. `var sequelizeInstance = new Sequelize(...)`
  @param modelsDirectoryPath String REQUIRED Absolute path to the directory where model definition files are stored.
  @return undefined
```

Example:

```
var path = require('path');
var Sequelize = require('sequelize');

var defineModels = require('sequelize-registry').defineModels;

var sequelize = new Sequelize('postgres://admin:supersecret@localhost:5432/myblog');
var modelsDir = path.join(__dirname, 'models');

defineModels(sequelize, modelsDir);
```

## Model Definitions

Model definitions mostly mirror the exact same options you would normally pass to `sequelize.define`. Consult the Sequelize documentation for further reference.

Model definitions are "Plain Old JavaScript Objects" (POJOs) with properties corresponding to associations and the various parameters of `sequelize.define`.

Example:

```
var definition = {
  // properties go here
};

module.exports = definition;
```

The `definition` object will be used to define a sequelize model via the `sequelize.define()` method.

Briefly, the `definition` object will be used as follows:

```
sequelize.define(definition.name, definition.cols, definition.opts || {});
```

### Configuration Property Reference

#### DEFINITION PROPERTIES

A definition may have the following properties.

#### `definition.name` (String) REQUIRED

The `name` property will be passed as the first parameter to `sequelize.define()`

Example:

```
var definition = {
  name: 'blog_post'
};

module.exports = definition;
```

#### `definition.cols` (Object) REQUIRED

The `cols` property will be passed as the second parameter to `sequelize.define()`. The options for the `cols` property are the exact same options as may be passed to Sequelize for defining columns in a model. Consult the Sequelize documentation for further information.

Example:

```
var Sequelize = require('sequelize');

var definition = {
  cols: {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Untitled'
    },
    price: Sequelize.INTEGER
  }
};

module.exports = definition;
```

#### `definition.opts` (Object) OPTIONAL

The `opts` property, if present, will be passed as the third parameter to `sequelize.define()`.  The options for the `opts` property are the exact same options as may be passed to Sequelize for defining the extra configuration options of a model. Consult the Sequelize documentation for further information.

Example:

```
var definition = {
  opts: {
    timestamps: false
  }
};

module.exports = definition;
```

#### `definition.refs` (Array of Objects) OPTIONAL

The `refs` property will be used to define associations. The `refs` property must be an array of objects. Each object in the array is a definition for an assocation to another model, also called a `ref`. See the `ref` properties documentation below.

Example:

```
var definition = {
  refs: [
    {
      // this is an individual ref object
      // ref options go here
    }
  ]
};

module.exports = definition;
```

#### REF PROPERTIES

A ref may have the following properties.

#### `ref.type` (String) REQUIRED

The `type` property of a ref will be used to determine the type of association.

Available options for a ref `type` are the names of the Sequelize association methods:

  - `hasOne`
  - `hasMany`
  - `belongsTo`
  - `belongsToMany`

Example:

```
var definition = {
  refs: [
    {
      type: 'hasMany',
      // ...
    }
  ]
};

module.exports = definition;
```

### `ref.model` (String) REQUIRED

The `model` property of a ref will be used to retrieve the associated model, by name, using `sequelize.model(ref.model)`.

Example:

```
var definition = {
  refs: [
    {
      type: 'belongsTo',
      model: 'category'
    }
  ]
};

module.exports = definition;
```

### `ref.config` (Object) OPTIONAL

The `config` property of a ref will be passed as the second argument to the association method. The keys of the object are any keys valid for the standard options accepted by Sequelize for that association type. As with a standard Sequelize association, this property may be omitted if the defaults association configuration options are acceptable.

Examples:

```
var definition = {
  refs: [
    {
      type: 'belongsTo',
      model: 'user',
      config: {
        foreignKey: 'uuid',
        targetKey: 'session_id',
        as: 'profile'
      }
    }
  ]
};

module.exports = definition;
```

```
var definition = {
  refs: [
    {
      type: 'belongsToMany',
      model: 'tag',
      config: {
        through: 'PostTags'
      }
    }
  ]
};

module.exports = definition;
```

# Known Limitations

 - Nested model directories are not supported yet. Model definition files must use a flat file structure.
 - Validation of definition structure exists but errors in configuration are still possible with any options passed directly to Sequelize.
