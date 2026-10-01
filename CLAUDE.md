# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Как вести этот файл

CLAUDE.md — только оглавление. Здесь живут `@`-импорты и ссылки, а не
объяснения. Если тему нужно расписать — заводи отдельный `.md` в `docs/`, а
сюда добавляй одну строку: импорт + комментарий «когда это читать». Не дублируй
содержимое подключённых файлов и не описывай то, что видно из структуры
репозитория. Правишь тему — правь её `.md`, а не этот файл.

@docs/core.md

<!-- Code style, architecture, API contract, terminology, workflow. Read ALWAYS when writing or planning code. -->

@docs/ui.md

<!-- Тема «Classical»: токены, значки состояний, каталог components/ui. Читай перед любой вёрсткой. -->

@AGENTS.md

<!-- Base context: Expo v56 docs rule, project language (Russian-only). Read ALWAYS. -->

@docs/commands.md

<!-- npm scripts: start/lint/format/test/ci, how to run a single test. Read when running, building or testing. -->

@docs/git_workflow.md

<!-- Branch naming, commit format, MR flow. Read when committing or branching. -->

@docs/hackathon_case.md

<!-- Product vision, target audience. Read when business context is needed. -->
