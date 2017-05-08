var VERBOSITY;
var fs = require('fs');
var path = require('path');

var knownAssociationTypes = [
  'hasOne',
  'hasMany',
  'belongsTo',
  'belongsToMany',
];

function verbosityLog(msg) {
  if (VERBOSITY) {
    console.log(msg);
  }
}

function getModelFilePaths(modelsDir) {
  var dirPath = path.normalize(modelsDir);
  var fileNames = fs.readdirSync(dirPath);
  var filePaths = fileNames.map(function(fileName) {
    return path.join(dirPath, fileName);
  });

  return filePaths;
}

function validateRef(ref) {
  var isValid = (
    ref && typeof ref === 'object'
  );

  if (!isValid) {
    verbosityLog("Invalid reference specification. Refernces must be objects.");
    return;
  }

  var isValidType = (
    typeof ref.type === 'string' &&
    ref.type.length > 0 &&
    knownAssociationTypes.indexOf(ref.type) !== -1
  );

  if (!isValidType) {
    verbosityLog("Invalid association type. Must be one of: " + knownAssociationTypes.join(', '));
    return;
  }

  var isValidModelName = (
    typeof ref.model === 'string' &&
    ref.model.length > 0
  );

  if (!isValidModelName) {
    verbosityLog("Missing model name.");
    return;
  }

  var isValidConfig = (
    typeof ref.config === 'undefined' || (
      ref.config !== null &&
      typeof ref.config === 'object'
    )
  );

  if (!isValidConfig) {
    verbosityLog("Invalid ref config options. ref.config must be an object with standard sequelize properties.");
    return;
  }

  return true;
}

function configureAssociations(sequelize, sourceModel, refs) {
  refs.forEach(function(ref) {
    if (!validateRef(ref)) {
      return;
    }

    var targetModel;

    try {
      targetModel = sequelize.model(ref.model);
    }
    catch(e) {
      verbosityLog(`    Relation (${ref.model}) not found`);
    }

    if (targetModel) {
      verbosityLog(`    Configuring ${ref.type}(${ref.model}) association`);

      var relateTo = ref.type;
      var settings = ref.config || {};

      sourceModel[relateTo](targetModel, settings);
    }
  });
}

function defineModel(sequelize, def) {
  verbosityLog(`DEFINING ${def.name} MODEL`);
  sequelize.define(def.name, def.cols, def.opts);
}

function defineModels(sequelize, modelsDir, isVerbose) {
  VERBOSITY = isVerbose || false;

  var modelPaths = getModelFilePaths(modelsDir);

  var defs = modelPaths.map(function(modelPath) {
    return require(modelPath);
  });

  defs.forEach(function(def) {
    defineModel(sequelize, def);
  });

  verbosityLog('');

  defs.forEach(function(def) {
    var hasRefs = (
      Array.isArray(def.refs) &&
      def.refs.length > 0
    );

    var sourceModel;

    if (hasRefs) {
      try {
        sourceModel = sequelize.model(def.name);
      }
      catch(e) {
        verbosityLog(`    Source (${ref.model}) not found`);
      }

      if (sourceModel) {
        verbosityLog(`CONFIGURING ${def.name} ASSOCIATIONS`);
        configureAssociations(sequelize, sourceModel, def.refs);
        verbosityLog('');
      }
    }
  });
}

module.exports = {
  defineModels: defineModels,
  defineModel: defineModel,
  configureAssociations: configureAssociations,
  getModelFilePaths: getModelFilePaths,
  validateRef: validateRef,
};
