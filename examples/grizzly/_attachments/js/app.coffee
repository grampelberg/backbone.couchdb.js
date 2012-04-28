# (c) 2011 Thomas Rampelberg, <thomas@saunter.org>

class Article extends Backbone.couch.Model

  _db: Backbone.couch.db 'backbone'
  defaults:
    type: "article"

class ArticleList extends Backbone.couch.Collection

  model: Article
  _db: Backbone.couch.db 'backbone'
  change_feed: true
  couch: () =>
    view: 'grizzly/type'
    key: 'article'
    filter:
      filter: 'grizzly/article'
      channel: @id
    include_docs: true

class Channel extends Backbone.couch.Model

  _db: Backbone.couch.db 'backbone'
  defaults:
    type: 'channel'

class ChannelList extends Backbone.couch.Collection

  model: Channel
  _db: Backbone.couch.db 'backbone'
  change_feed: true
  couch: () ->
    view: 'grizzly/type'
    key: 'channel'
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
    @model.bind("remove", @_remove)

  _remove: () =>
    @remove()

  remove_post: () =>
    @model.destroy()

  allow_update: () =>
    $(@el).removeClass("display").addClass("edit")
    @$("textarea").val(@$("p").text())

  save_update: () =>
    $(@el).removeClass("edit").addClass("display")
    @model.set({ body: @$("textarea").val() })
    @model.save()

  update_post: () =>
    @$("p").text(@model.get("body"))

class BaseContainer extends BaseView

  events:
    "click .create": "create_article"
  initialize: () ->
    @col = new @collection
    @col.bind('refresh', @refresh)
    @col.bind('add', @add)
    @col.fetch()

  refresh: () =>
    @col.each(@add)

  add: (model) =>
    view = new @item_view
      model: model
    @$("ul").append view.render().el

  create_article: () =>
    model = new @col.model
      body: @$(@input).val()
    model.save()

    @col.add model

class Articles extends BaseContainer

  template: "article_list"
  collection: ArticleList
  item_view: ArticleView
  input: "textarea"

class ChannelView extends BaseView

  tagName: "li"
  className: "display"
  template: "channel"

class Channels extends BaseContainer

  template: "channel_list"
  collection: ChannelList
  item_view: ChannelView
  input: "input[type=text]"

class App extends Backbone.View
  el: $("#main")
  initialize: () ->
    @$(".channels").html (new Channels).render().el
    @$(".articles").html (new Articles).render().el

$(document).ready(->
  new App
  )
