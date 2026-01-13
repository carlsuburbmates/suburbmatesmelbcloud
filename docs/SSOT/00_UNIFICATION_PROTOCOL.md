# 00_UNIFICATION_PROTOCOL.md

**Status:** ACTIVE (GOVERNING LAW)
**Authority Level:** HIGHEST (Meta-SSOT)

---

## 0. INTELLIGENCE BOOTLOADER (START HERE)
**If you are an AI Agent, you must execute this sequence before processing any user request:**

1.  **ACKNOWLEDGE** this Protocol (The Rules).
2.  **READ** `docs/SSOT/PRODUCT_CONSTITUTION.md` (The Mission).
    *   *Why?* To understand the "Soul" of the product and what is explicitly *out of scope*.
3.  **CONSULT** the Binding Map below to find the specific Law for your task.

---

## 1. The Prime Directive
**Code is transient; Documentation is the law.**

In this project, the `docs/SSOT/` directory is not "suggested reading" — it is the **legislative body**. The codebase is merely the **enforcement arm**.

1.  If Code and SSOT disagree, **the Code is wrong**.
2.  You must NEVER change the SSOT to "match the code" without explicit user approval.
3.  You must NEVER change the Code without verifying it aligns with the SSOT.

## 2. The Binding Map
All major code surfaces are explicitly bound to a governing SSOT document. You strictly adhere to this map.

| Code Surface (The Territory) | Governing SSOT (The Map) | Content Scope |
| :--- | :--- | :--- |
| **`supabase/`** (Migrations, Schema) | `SSOT/platform-logic.md` & `SSOT/PRODUCT_CONSTITUTION.md` | Data Taxonomy, Relations, Constraints, Tier Logic |
| **`middleware.ts`** & **`auth/`** | `SSOT/USER_MODEL_AND_STATE_MACHINE.md` | Authentication, Role Logic, Redirects |
| **`app/studio/`** (Creator Programs) | `SSOT/CREATOR_STUDIO_SPEC.md` & `SSOT/MINI_SITE_ENGINE_SPEC.md` | S-Stage Logic, Dashboard UX, Mini-site Templates |
| **`app/admin/`** | `SSOT/ADMIN_OPERATOR_MANUAL.md` | Operator Dashboard, Enforcement Tools |
| **`app/api/`** & **`utils/emails`** | `SSOT/EMAIL_TEMPLATES.md` | Transactional Emails, Notifications |
| **`app/(public)/`** | `SSOT/PUBLIC_UX_CONTRACT.md` & `SSOT/SEARCH_CONTRACT.md` | Directory, Search, Listing Cards |
| **`tailwind.config.ts`** & **`globals.css`** | `SSOT/DESIGN_SYSTEM_APPLICATION.md` | Design Tokens, Colors, Typography |
| **Content & Terms** | `SSOT/CANONICAL_TERMINOLOGY.md` & `SSOT/TAXONOMY_CONTRACT.md` | Naming Conventions, Categories |

## 3. The "Deviation Check" Mandate
Before writing a single line of code, any Agent working on this project MUST:

1.  **Identify** which Code Surface they are touching.
2.  **Consult** the Binding Map above.
3.  **Read** the Governing SSOT.
4.  **Declare** in their plan: *"I have verified this change aligns with [Specific SSOT] section [X]."*

## 4. Conflict Resolution
If you discover a conflict (e.g., the code allows 5 products but the SSOT says 3):
1.  **Stop.** Do not "fix" it silently.
2.  **Report** the Deviation to the User.
3.  **Ask:** "Shall I enforce the SSOT (change code) or amend the Constitution (change SSOT)?"

---
*This protocol is the first file read by any incoming intelligence. It ensures no deviation happens, regardless of the task.*
