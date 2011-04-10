# (c) 2011 Thomas Rampelberg, <thomas@saunter.org>

class Article extends Backbone.couch.Model

  _db: Backbone.couch.db 'backbone'
  defaults:
    type: "article"

class ArticleList extends Backbone.couch.Collection

  model: Article
  _db: Backbone.couch.db 'backbone'
  couch: () ->
    view: 'grizzly/type'
    key: 'article'
    include_docs: true

class BaseView extends Backbone.View

  _get_template: (name) =>
    if not BaseView._template_cache[name]?
      BaseView._template_cache[name] = Handlebars.compile $("##{name}").html()
    BaseView._template_cache[name]

  render: () =>
    opts = @model?.toJSON() ? {}
    _.extend opts, @options ? {}
    $(@el).html @_get_template(@template)(opts)
    _.defer () => @trigger 'render'
    @

BaseView._template_cache = {}

class ArticleView extends BaseView

  tagName: "li"
  template: "article"
  events:
    "click button": "remove_post"

  remove_post: () =>
    console.log @model
    @model.destroy()
    @remove()

class Articles extends Backbone.View

  el: $("#main")
  events:
    "click .create": "create_article"

  initialize: () ->
    @col = new ArticleList
    @col.bind('refresh', @refresh)
    @col.bind('add', @add)
    @col.fetch()

  refresh: () =>
    @col.each(@add)

  add: (model) =>
    view = new ArticleView
      model: model
    @$("ul").append view.render().el

  create_article: () =>
    model = new Article
      body: @$("textarea").val()
    model.save()

    @col.add model

new Articles
