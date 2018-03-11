defmodule Emojichats.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :user, :integer
      add :message, :string

      timestamps()
    end

  end
end
