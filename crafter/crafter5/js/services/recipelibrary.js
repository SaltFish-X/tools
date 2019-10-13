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
    var key = cache_key(lang, cls)
    var jobObj = [
      { id: 8, name: 'Carpenter' },
      { id: 9, name: 'Blacksmith' },
      { id: 10, name: 'Armorer' },
      { id: 11, name: 'Goldsmith' },
      { id: 12, name: 'Leatherworker' },
      { id: 13, name: 'Weaver' },
      { id: 14, name: 'Alchemist' },
      { id: 15, name: 'Culinarian' }
    ]
    var nameZh, nameOther
    var nameZhUrl = 'https://cdn.ffxivteamcraft.com/assets/data/zh/zh-items.json'
    var nameOtherUrl = 'https://cdn.ffxivteamcraft.com/assets/data/items.json'
    // return this.$http
    //   .get(nameOtherUrl)
    //   .then(res => {
    //     nameOther = res.data
    //   })
    //   .then(res => {
    //     return this.$http.get(nameZhUrl).then(res => {
    //       nameZh = res.data
    //     })
    //   })
    //   .then(res => {
    //     return this.$http.get('https://cdn.ffxivteamcraft.com/assets/data/recipes.json').then(res => {
    //       var job = jobObj.find(e => e.name === cls)
    //       var jobId = job.id
    //       var resArr = res.data.filter(e => e.job === jobId)
    //       resArr.forEach(e => {
    //         lang === 'cn'
    //           ? (e.name = { cn: (nameZh[e.result] && nameZh[e.result].zh) || '暂无翻译' })
    //           : (e.name = { [lang]: nameOther[e.result] && nameOther[e.result][lang] })
    //         e.baseLevel = e.level
    //       })

    //       var result = resArr.map(recipeForLang.bind(this, lang))
    //       result.sort((a, b) => a.level - b.level)
    //       return result
    //     })
    //   })

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
