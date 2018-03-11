defmodule EmojichatsWeb.DemoChannel do
  use EmojichatsWeb, :channel

  def join("demo:lobby", payload, socket) do
    if authorized?(payload) do
      #{:ok, socket}
      messages = Emojichats.Chat.list_messages()
      payload = EmojichatsWeb.MessageView.render("index.json", messages: messages)
      {:ok, payload, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (demo:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  def handle_in("message", payload, socket) do
    broadcast socket, "message", payload
    {:noreply, socket}
  end


  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
