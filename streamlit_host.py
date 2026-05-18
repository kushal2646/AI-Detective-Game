"""Shared Streamlit host logic for app.py and streamlit_app.py."""

from __future__ import annotations

import os
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components

ROOT = Path(__file__).resolve().parent


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _host_api_key() -> str:
    """API key from Streamlit secrets or environment (for Cloud deploy)."""
    try:
        key = st.secrets.get("ANTHROPIC_API_KEY", "")
        if key:
            return str(key).strip()
    except (AttributeError, FileNotFoundError, KeyError):
        pass
    return os.environ.get("ANTHROPIC_API_KEY", "").strip()


def build_game_html(api_key: str = "") -> str:
    """Bundle index.html with inlined CSS/JS for iframe embedding."""
    page = _read_text(ROOT / "index.html")
    css = _read_text(ROOT / "static" / "css" / "style.css")
    levels_js = _read_text(ROOT / "static" / "js" / "levels.js")
    game_js = _read_text(ROOT / "static" / "js" / "game.js")

    page = page.replace(
        '<link rel="stylesheet" href="static/css/style.css">',
        f"<style>\n{css}\n</style>",
    )
    page = page.replace(
        '<script src="static/js/levels.js"></script>\n  <script src="static/js/game.js"></script>',
        (
            (f'<script>window.__ANTHROPIC_API_KEY_FROM_HOST__ = {repr(api_key)};</script>\n  '
             if api_key
             else "")
            + f"<script>\n{levels_js}\n</script>\n  "
            + f"<script>\n{game_js}\n</script>"
        ),
    )
    return page


def main() -> None:
    st.set_page_config(
        page_title="AI Detective",
        page_icon="🔍",
        layout="wide",
        initial_sidebar_state="collapsed",
    )

    st.markdown(
        """
        <style>
          #MainMenu, footer, header[data-testid="stHeader"] { visibility: hidden; }
          .block-container { padding-top: 0.5rem; padding-bottom: 0; max-width: 100%; }
        </style>
        """,
        unsafe_allow_html=True,
    )

    host_key = _host_api_key()
    if host_key:
        st.caption("AI features enabled via server configuration.")
    else:
        with st.expander("Deploy note — enable AI on Streamlit Cloud", expanded=False):
            st.markdown(
                "Add your Anthropic key under **Settings → Secrets** as `ANTHROPIC_API_KEY`, "
                "or enter it in-game via **API Settings**. "
                "Without a key, the game runs in demo mode."
            )

    game_html = build_game_html(host_key)
    components.html(game_html, height=920, scrolling=True)
