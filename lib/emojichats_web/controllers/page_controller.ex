defmodule EmojichatsWeb.PageController do
  use EmojichatsWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
