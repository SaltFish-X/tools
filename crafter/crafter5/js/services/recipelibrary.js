;(function() {
  'use strict'

  angular
    .module('ffxivCraftOptWeb.services.recipelibrary', ['ffxivCraftOptWeb.services.actions', 'ffxivCraftOptWeb.services.locale'])
    .service('_recipeLibrary', RecipeLibraryService)

  function RecipeLibraryService($http, $q, _allClasses, _languages) {
    this.$http = $http
    this.$q = $q
    this._allClasses = _allClasses
    this._languages = _languages
    this.cache = {}
  }

  RecipeLibraryService.$inject = ['$http', '$q', '_allClasses', '_languages']

  RecipeLibraryService.prototype.recipesForClass = function(lang, cls) {
    if (!angular.isDefined(lang)) lang = 'en'
    if (!this._languages[lang]) {
      return this.$q.reject(new Error('invalid language: ' + lang))
    }
    if (this._allClasses.indexOf(cls) < 0) {
      return this.$q.reject(new Error('invalid class: ' + cls))
    }

    return this.$http.get('data/recipedb/' + cls + '.json').then(r => {
      var result = r.data.map(recipeForLang.bind(this, lang))
      return result.sort((a, b) => a.level - b.level).sort((a, b) => a.name - b.name)
    })
  }

  RecipeLibraryService.prototype.recipeForClassByName = function(lang, cls, name) {
    if (!angular.isDefined(lang)) lang = 'en'
    return this.recipesForClass(lang, cls).then(
      function(recipes) {
        for (var i = 0; i < recipes.length; i++) {
          var recipe = recipes[i]
          if (recipe.name == name) {
            return recipe
          }
        }
        return this.$q.reject(new Error('could not find recipe'))
      }.bind(this)
    )
  }

  function recipeForLang(lang, recipe) {
    var r = {}
    for (var p in recipe) {
      if (recipe.hasOwnProperty(p) && p != 'name') {
        r[p] = recipe[p]
      }
    }
    r.name = recipe.name[lang]
    return r
  }

  function cache_key(lang, cls) {
    return lang + ':' + cls
  }
})()
