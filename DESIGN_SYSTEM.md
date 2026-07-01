# Mozo Coffee Design System

This project uses a shared design system based on the Mozo colour direction: brown, white, black, and warm beige neutrals.

## Core Design Tokens

Defined in app/globals.css:

- --mozo-primary: #8b5e3c
- --mozo-primary-dark: #5a3a22
- --mozo-primary-light: #c49a6c
- --mozo-beige: #f1e7da
- --mozo-bg: #faf7f2
- --mozo-white: #ffffff
- --mozo-black: #1a1a1a
- --mozo-text-secondary: #5c5c5c
- --mozo-border: #e5dccf

## Global Surface

- Page background uses .mozo-page
- Default cards use .mozo-card
- Highlight cards use .mozo-card-dark

## Typography Helpers

- .mozo-title: major page heading
- .mozo-subtitle: supporting text

## Forms

- .mozo-field-label
- .mozo-input
- .mozo-select
- .mozo-textarea

## Buttons

Always include .mozo-btn plus a variant:

- .mozo-btn-primary
- .mozo-btn-outline
- .mozo-btn-danger

## Tables

- Container: .mozo-table-wrap
- Table element: .mozo-table
- Status chips: .mozo-badge and variant
  - .mozo-badge-scheduled
  - .mozo-badge-completed
  - .mozo-badge-cancelled

## Admin Shell

- Outer shell: .mozo-admin-shell
- Sidebar: .mozo-admin-sidebar
- Nav item: .mozo-admin-link
- Main content: .mozo-admin-main

## Usage Rule

When creating or editing pages, avoid hard-coded Tailwind colours like bg-blue-500 or text-gray-500. Prefer design-system classes so all screens remain visually consistent.
