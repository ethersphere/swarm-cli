# This is a descriptor for the Nix package manager.
# Invoke nix-shell in this directory to enter an environment where
# everything gets downloaded and made available for development.

{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    coreutils diffutils
    bash-completion less
    gitFull
    nodejs

    # keep this line if you use bash
    bashInteractive
  ];
}
