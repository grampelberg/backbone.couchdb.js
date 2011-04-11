# (c) 2011 Thomas Rampelberg, <thomas@saunter.org>

class Article extends Backbone.couch.Model

  _db: Backbone.couch.db 'backbone'
  defaults:
    type: "article"

class ArticleList extends Backbone.couch.Collection

  model: Article
  _db: Backbone.couch.db 'backbone'
  change_feed: true
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
  className: "display"
  template: "article"
  events:
    "click .del": "remove_post"
    "click .edit": "allow_update"
    "click .save": "save_update"

  initialize: () =>
    @model.bind("change:body", @update_post)

  remove_post: () =>
    @model.destroy()
    @remove()

  allow_update: () =>
    $(@el).removeClass("display").addClass("edit")
    @$("textarea").val(@$("p").text())

  save_update: () =>
    $(@el).removeClass("edit").addClass("display")
    @model.set({ body: @$("textarea").val() })
    @model.save()

  update_post: () =>
    @$("p").text(@model.get("body"))

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
