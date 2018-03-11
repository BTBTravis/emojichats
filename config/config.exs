# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# General application configuration
config :emojichats,
  ecto_repos: [Emojichats.Repo]

# Configures the endpoint
config :emojichats, EmojichatsWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "HUJuAD7Q7a91YNEgFBeUmg3NMxCwTugYFDOqZF/oxvsIH/Si/zhZoBbtF1rk7R4V",
  render_errors: [view: EmojichatsWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Emojichats.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:user_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
