defmodule EmojichatsWeb.MessageView do
  use EmojichatsWeb, :view
  alias EmojichatsWeb.MessageView

  def render("index.json", %{messages: messages}) do
    %{data: render_many(messages, MessageView, "message.json")}
  end

  def render("show.json", %{message: message}) do
    %{data: render_one(message, MessageView, "message.json")}
  end

  def render("message.json", %{message: message}) do
    %{id: message.id,
      created_at: message.inserted_at,
      user: message.user,
      message: message.message}
  end
end
