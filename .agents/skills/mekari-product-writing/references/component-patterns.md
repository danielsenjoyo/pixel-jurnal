# Component copy patterns

Every length limit is collected in one table in [formatting.md](formatting.md). The caps repeated below
are the same numbers, kept beside the pattern they apply to.

## Inputs

### Inline error

Appears below a form field when validation fails. Must be:

- **Imperative** — say what to do, not just what went wrong
- **Contextual** — include the object or constraint when it helps (count, type of item)
- **Never accusatory** — no "You must", "You forgot", "Invalid input", "is required"
- **No period** on a single clause

| Scenario                            | 🇺🇸 EN                                                  | 🇮🇩 ID                                              | 🇧🇷 PT-BR                                                   |
| ----------------------------------- | ------------------------------------------------------ | -------------------------------------------------- | ---------------------------------------------------------- |
| Required field empty                | `Enter a/an [field name]`                              | `Masukkan [field name]`                            | `Insira [field name]`                                      |
| Required field, uncountable noun    | `Enter [field name]`                                   | `Masukkan [field name]`                            | `Insira [field name]`                                      |
| Required field, invalid format      | `Enter a correct [field name]`                         | `Masukkan [field name] yang benar`                 | `Insira [field name] correto`                              |
| Required field, out of range        | `Enter a/an [field name] above [n]`                    | `Masukkan [field name] di atas [n]`                | `Insira [field name] acima de [n]`                         |
| Required selection, single          | `Select a [object]`                                    | `Pilih [object]`                                   | `Selecione um [object]`                                    |
| Required selection, minimum count   | `Select at least [n] [object]`                         | `Pilih setidaknya [n] [object]`                    | `Selecione pelo menos [n] [object]`                        |
| Required selection, specific action | `[Verb] at least [n] [object]`                         | `[Verb] setidaknya [n] [object]`                   | `[Verb] pelo menos [n] [object]`                           |
| Required upload                     | `Upload [file type or label]`                          | `Upload [file type or label]`                      | `Faça upload de [file type or label]`                      |
| Email format                        | `Enter a correct email: name@example.com`              | `Masukkan email yang benar: nama@example.com`      | `Insira um e-mail correto: nome@example.com`               |
| Already taken                       | `[Label] already taken`                                | `[Label] sudah digunakan`                          | `[Label] já está em uso`                                   |
| Invalid input, cause known          | `[The underlying cause]. Please [how to fix it]`       | `[The underlying cause]. Silakan [how to fix it]`  | `[The underlying cause]. Por favor, [how to fix it]`       |
| File format                         | `File must be in [format] with a maximum of [size] MB` | `File harus berformat [format] maksimum [size] MB` | `O arquivo deve estar em [format] com no máximo [size] MB` |

**Articles: use `a/an`, never `the`.** An empty required field holds no value yet, so `a/an` is correct;
`the` implies a value the user already picked. Drop the article only for an **uncountable noun**:
`Enter button text`, never `Enter a button text`.

**Placeholders keep no article** (`Enter template name`, `Enter dynamic value`) — they are hint text, not
sentences. So the error and the placeholder for the same field read differently on purpose: placeholder
`Enter campaign name`, error `Enter a campaign name`. That is correct, not an inconsistency.

**Before / after:**

| ❌ Old                         | ✅ New                                    | Issue                                    |
| ------------------------------ | ----------------------------------------- | ---------------------------------------- |
| `Agent name is required`       | `Enter an agent name`                     | Accusatory, passive                      |
| `You must select a product`    | `Select a product`                        | Accusatory                               |
| `You must associate product`   | `Associate at least 1 product`            | Accusatory, missing count                |
| `You must select at least one` | `Select at least 1 [object]`              | Accusatory, missing object               |
| `Invalid email format`         | `Enter a correct email: name@example.com` | Jargon, no guidance                      |
| `Field cannot be empty`        | `Enter a [field name]`                    | Passive, no context                      |
| `Request user phone number`    | `Request customer phone number`           | "user" means the agent, not the end user |

> "You must" reads as accusatory and creates friction, especially in forms with many required fields
> where users face several errors at once. The imperative is shorter, less accusatory, and leaves room for
> specific context — quantity, object type, constraints — inside the message.

### Select

| Variant                    | 🇺🇸 EN                       | 🇮🇩 ID                      | 🇧🇷 PT-BR                         |
| -------------------------- | --------------------------- | -------------------------- | -------------------------------- |
| Single select placeholder  | `Select [label name]`       | `Pilih [label name]`       | `Selecione [label name]`         |
| Multi or searchable select | `Search or select [object]` | `Cari atau pilih [object]` | `Pesquise ou selecione [object]` |

Placeholders take no article. The matching inline error does — `Select a sender` — and that difference
is intentional, not an inconsistency.

### Checkbox

| Part         | Max     | Punctuation | Case     | Vocabulary                      |
| ------------ | ------- | ----------- | -------- | ------------------------------- |
| Title        | 4 words | No period   | Sentence | Noun                            |
| Option label | 4 words | No period   | Sentence | Noun, phrase, or short sentence |

- **Frame the label positively.** `Receive product updates`, not `Do not receive product updates`. A
  checkbox that means the opposite of what it says when ticked is a trap.
- **Name the action** where the checkbox causes one, rather than describing a setting abstractly.
- **Never combine two actions in one checkbox.** If ticking it does two separable things, the user cannot
  consent to one and refuse the other. Split it.

Error when nothing is selected: `Select at least 1 [object]` — see [Inline error](#inline-error).

### Toggle

| Part  | Max     | Punctuation | Case                                    |
| ----- | ------- | ----------- | --------------------------------------- |
| Label | 5 words | No period   | Sentence. Title Case for a feature name |

Use the **imperative** when flipping it performs an action that changes behaviour: `Enable notifications`,
`Require approval`.

Use a **noun phrase** when it names a state the user is switching between: `Dark mode`, `Auto-save`.

Do not mix the two forms in one settings group.

### Date picker

| Part        | Rule                                                  |
| ----------- | ----------------------------------------------------- |
| Label       | Optional. When present, follows the field label rules |
| Placeholder | Format hint only, no sentence: `DD/MM/YYYY`           |

Display formats, ranges, and month and day abbreviations live in
[numbers-and-time.md](numbers-and-time.md) — a date reads the same everywhere it appears.

| Error                      | 🇺🇸 EN                                  | 🇮🇩 ID                                             | 🇧🇷 PT-BR                                       |
| -------------------------- | -------------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| Format not recognised      | `Enter a correct date format`          | `Masukkan format tanggal yang benar`              | `Insira um formato de data correto`            |
| End date before start date | `End date cannot be before start date` | `Tanggal akhir tidak boleh sebelum tanggal mulai` | `A data final não pode ser anterior à inicial` |

The first one deliberately avoids `Invalid date format` — see the jargon table in
[formatting.md](formatting.md).

## Actions

### Button

| Property    | Rule                                                                       |
| ----------- | -------------------------------------------------------------------------- |
| Max words   | 3 preferred, 4 when the context genuinely needs it                         |
| Punctuation | No period, no exclamation mark                                             |
| Case        | Sentence case. Title Case only for a feature name                          |
| Vocabulary  | Action phrase for a step in a flow; noun phrase for navigation or settings |
| Articles    | None. `Save changes`, never `Save the changes`                             |

Which verb to use is decided in [verbs.md](verbs.md), not here.

## Feedback

### Toast

Success or error feedback after an action. Success takes `[Object] [past participle]`; a specific
failure takes `Failed to [verb] [object]`. Reach for the general error only when the cause is unknown.
Articles used naturally; period rule per [period rules](formatting.md).
For settings pages, use the page object name: `Team changes saved`.

| Scenario      | 🇺🇸 EN                                      | 🇮🇩 ID                                               | 🇧🇷 PT-BR                                   |
| ------------- | ------------------------------------------ | --------------------------------------------------- | ------------------------------------------ |
| Saved         | [Object] saved                             | [Object] berhasil disimpan                          | [Object] salvo                             |
| Changes saved | [Page object] changes saved                | Perubahan [page object] berhasil disimpan           | Alterações de [page object] salvas         |
| Deleted       | [Object name] deleted                      | [Object name] berhasil dihapus                      | [Object name] excluído                     |
| Submitted     | [Object] submitted                         | [Object] berhasil dikirim                           | [Object] enviado                           |
| Approved      | [Object] approved                          | [Object] berhasil disetujui                         | [Object] aprovado                          |
| Rejected      | [Object] rejected                          | [Object] berhasil ditolak                           | [Object] rejeitado                         |
| Sent          | [Object] sent                              | [Object] terkirim                                   | [Object] enviado                           |
| Assigned      | [Object] assigned to [Agent]               | [Object] ditugaskan ke [Agent]                      | [Object] atribuído a [Agent]               |
| Handed over   | [Object] handed over to [Agent]            | [Object] diserahkan ke [Agent]                      | [Object] transferido para [Agent]          |
| With context  | [Object] [action taken]. [Additional info] | [Object] berhasil [action taken]. [Additional info] | [Object] [action taken]. [Additional info] |
| Download      | Download will start automatically          | Download akan dimulai otomatis                      | O download começará automaticamente        |
| Failed action | Failed to [verb] [object]                  | Gagal [verb] [object]                               | Falha ao [verb] [object]                   |
| General error | Something went wrong, please try again     | Terjadi kesalahan, silakan coba lagi                | Algo deu errado, tente novamente           |

**Download is the one success toast that is not a past participle.** The toast fires the moment the
link is clicked, but the browser starts the transfer after that, so `[Object] downloaded` asserts
something that has not happened yet. Announce what is about to happen instead.

The object is dropped on purpose: the link the reader just clicked already names it, so repeating it
costs the toast its whole character budget and tells them nothing new. `Download` stays English in
Indonesian per [core action verbs](verbs.md).

### Tooltip

Contextual help on hover or focus. Period only if the content is a complete sentence.

| Copy                                                              | Period?   | Why                      |
| ----------------------------------------------------------------- | --------- | ------------------------ |
| `Select payment method`                                           | No        | Fragment, not a sentence |
| `Select a payment method to continue.`                            | Yes       | Complete sentence        |
| `This action cannot be undone. All related data will be removed.` | Yes, both | Two complete sentences   |

### Modal

| Scenario                          | 🇺🇸 EN                                                                            | 🇮🇩 ID                                                                                   | 🇧🇷 PT-BR                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Delete confirm                    | **Delete [object type]?**<br>Once deleted, **[object name]** cannot be restored. | **Hapus [object type]?**<br>Setelah dihapus, **[object name]** tidak dapat dipulihkan.  | **Excluir [object type]?**<br>Uma vez excluído, **[object name]** não pode ser restaurado. |
| Submit confirm                    | **Submit [object]?**<br>[Describe the main impact].                              | **Kirim [object]?**<br>[Describe the main impact].                                      | **Enviar [object]?**<br>[Describe the main impact].                                        |
| Save changes                      | **Save changes?**<br>[Describe the main impact].                                 | **Simpan perubahan?**<br>[Describe the main impact].                                    | **Salvar alterações?**<br>[Describe the main impact].                                      |
| Approve confirm                   | **Approve [object]?**<br>[Describe the main impact].                             | **Setujui [object]?**<br>[Describe the main impact].                                    | **Aprovar [object]?**<br>[Describe the main impact].                                       |
| Leave page (create / new form)    | **Leave this page?**<br>Information you entered will not be saved.               | **Tinggalkan halaman ini?**<br>Informasi yang Anda masukkan tidak akan tersimpan.       | **Sair desta página?**<br>As informações inseridas não serão salvas.                       |
| Leave page (edit / existing data) | **Leave this page?**<br>Your changes will not be saved.                          | **Tinggalkan halaman ini?**<br>Perubahan Anda tidak akan disimpan.                      | **Sair desta página?**<br>Suas alterações não serão salvas.                                |
| Leave page (create with draft)    | **Leave this page?**<br>Information you entered will be saved as draft.          | **Tinggalkan halaman ini?**<br>Informasi yang Anda masukkan akan disimpan sebagai draf. | **Sair desta página?**<br>As informações inseridas serão salvas como rascunho.             |
| Leave process (create)            | **Leave this process?**<br>Information you entered will not be saved.            | **Tinggalkan proses ini?**<br>Informasi yang Anda masukkan tidak akan tersimpan.        | **Sair deste processo?**<br>As informações inseridas não serão salvas.                     |
| Leave process (edit)              | **Leave this process?**<br>Your changes will not be saved.                       | **Tinggalkan proses ini?**<br>Perubahan Anda tidak akan disimpan.                       | **Sair deste processo?**<br>Suas alterações não serão salvas.                              |

Leave-page buttons: primary **Leave** / **Tinggalkan** / **Sair** · ghost **Keep editing** / **Lanjut mengubah** / **Continuar editando**

> **Page or process?** Ask what the user loses, not where the screen is drawn. They do not know whether
> something is a route or an overlay, and it does not change what leaving costs them.
>
> - **`Leave this page?`** — a plain page with a single form, where leaving means navigating away. This is
>   the narrower case.
> - **`Leave this process?`** — everything else. Anything overlaid (`MpDrawer`, `MpModal` at any size
>   including `size="full"`), and any staged flow wherever it renders. A full modal covers the screen but
>   does not replace it, so "leave this page" is untrue. A wizard is a process even on its own route —
>   someone three steps in is abandoning their progress, not their location.
>
> A wizard is a pattern, not a container: `MpStepper` plus staged content. Its container decides nothing
> here, which is the point — both readings land on `Leave this process?` anyway.
>
> **In practice**, `Leave this page?` covers settings and simple CRUD — inviting a user, editing a user,
> creating or editing a team. One form, one route, no steps. Campaign creation, agent creation, top-up,
> and every drawer take `Leave this process?`.
>
> The quickest check on an existing screen: if the file references a stepper or tracks a current step, it
> is a process, whatever its title says today.
>
> **Which variant:** create or new form → "Information you entered" (no prior state, filling from
> scratch). Edit or existing data → "Your changes" (more precise). This split applies to processes too,
> not only pages — editing inside a drawer takes "Your changes", the same as editing on a page.
>
> "on this page" is dropped from every variant — redundant in a modal.

### Drawer

Title: sentence case, no period, and it names what the user is doing rather than describing the panel.
`Create bot response`, never `Creation of bot response`.

| Scenario    | 🇺🇸 EN              | 🇮🇩 ID             | 🇧🇷 PT-BR               |
| ----------- | ------------------ | ----------------- | ---------------------- |
| Creation    | `Create [object]`  | `Buat [object]`   | `Criar [object]`       |
| Editing     | `Edit [object]`    | `Ubah [object]`   | `Editar [object]`      |
| Detail view | `[Object] details` | `Detail [object]` | `Detalhes de [object]` |
| Filtering   | `All filters`      | `Semua filter`    | `Todos os filtros`     |
| Comparing   | `Comparison`       | `Perbandingan`    | `Comparação`           |

Leaving a drawer mid-task uses the leave-process modal in [Modal](#modal), never the leave-page one.

### Deletion

Deletion is permanent. The modal title, modal body, and success toast must together identify the object
so the user does not lose track of which item they selected — the modal sits centered, away from the list.

- **Modal title** — object **type** only. Sentence case, plain, no quotes, no object name.
- **Modal body** — object **name** in **bold**, no quotes. Truncated with `...` past **57 characters**.
- **Toast** — object **name** in plain text. No bold, no quotes. Same 57-char truncation.

Object type is the noun for the item's kind (`team`, `contact`, `template`) and is never truncated.
This is the one place a truncated string has no way back to its full value — see
[Truncation](formatting.md).
Object name is the user-created label (`Mekari Solusi Nusantara Abadi`) and is what gets truncated.

Example — object type `team`, object name `Mekari Solusi Nusantara Abadi Sejahtera Grup Indonesia`:

| Slot        | 🇺🇸 EN                                                         | 🇮🇩 ID                                                                | 🇧🇷 PT-BR                                                               |
| ----------- | ------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Modal title | **Delete team?**                                              | **Hapus tim?**                                                       | **Excluir equipe?**                                                    |
| Modal body  | Once deleted, **Mekari Solusi Nusant...** cannot be restored. | Setelah dihapus, **Mekari Solusi Nusant...** tidak dapat dipulihkan. | Uma vez excluído, **Mekari Solusi Nusant...** não pode ser restaurado. |
| Toast       | Mekari Solusi Nusant... deleted                               | Mekari Solusi Nusant... berhasil dihapus                             | Mekari Solusi Nusant... excluído                                       |

Use **Remove** instead of Delete when the action only takes the item out of a view or list without
deleting it from the system — see [core action verbs](../../mekari-product-writing/references/verbs.md).

### Duplication

The default name of a copy follows a predictable pattern so the original and its copies are easy to
tell apart at a glance.

- **First duplicate** — `Copy of [Object name]`
- **Subsequent** — `Copy of [Object name] (2)`, `(3)`, and so on

| Copy | 🇺🇸 EN                       | 🇮🇩 ID                            | 🇧🇷 PT-BR                     |
| ---- | --------------------------- | -------------------------------- | ---------------------------- |
| 1st  | `Copy of Broadcast May`     | `Salinan dari Broadcast May`     | `Cópia de Broadcast May`     |
| 2nd  | `Copy of Broadcast May (2)` | `Salinan dari Broadcast May (2)` | `Cópia de Broadcast May (2)` |
| 3rd  | `Copy of Broadcast May (3)` | `Salinan dari Broadcast May (3)` | `Cópia de Broadcast May (3)` |

### Blank slate

Description **always ends with a period**, including a single sentence — see [period rules](formatting.md).

Three cases. Default to the first.

**1. Default — nothing exists yet, and there is nothing useful to add:**

|             | 🇺🇸 EN                                | 🇮🇩 ID                                               | 🇧🇷 PT-BR                                   |
| ----------- | ------------------------------------ | --------------------------------------------------- | ------------------------------------------ |
| Title       | `No [Object] yet` — Object plural    | `Belum ada [Object]`                                | `Nenhum [Object] ainda`                    |
| Description | `[Object] you add will appear here.` | `[Object] yang Anda tambahkan akan muncul di sini.` | `Os [Object] adicionados aparecerão aqui.` |

The description verb matches the real action — `you add`, `you create`, `you import`.

**2. Actionable — the user can act, and the payoff is worth naming:**

|             | 🇺🇸 EN                                        | 🇮🇩 ID                          | 🇧🇷 PT-BR                   |
| ----------- | -------------------------------------------- | ------------------------------ | -------------------------- |
| Title       | `[Object] will appear here`                  | `[Object] akan muncul di sini` | `[Object] aparecerão aqui` |
| Description | The main action, plus what it gets the user. | Same structure                 | Same structure             |

Approved examples already shipping in the product:

- `Create your first WhatsApp campaign to start reaching your customers.`
- `Create your first WhatsApp template to start sending campaigns.`
- `Create a property to track custom information on tickets.`
- `Add a Facebook page to start receiving and replying to messages from your customers.`

**3. Not the user's action — the object arrives from an event, not from a button.** Same title as case 2.
Name the condition rather than inventing an action the user cannot take:

- `Calls will appear here once your team starts making or receiving them.`

**Keep it to one line where it can be** ([concision](formatting.md)) — a blank slate is glanced at, not read. Take
a second line only when the meaning needs it: an unfamiliar prerequisite, or a condition the user would
otherwise guess wrong. `Add a Facebook page to start receiving and replying to messages from your
customers.` earns its length.

What never earns extra length: restating the title, listing what the screen will show, or naming a second
outcome. Cut those first.

Indonesian runs longer than English ([translation](translation.md)), so a
description that only just fits on one line in EN will wrap in ID. Leave headroom, or flag it.

**Use the product's own verbs in the payoff clause** — `view`, `track`, `send`, `reach` — not loose
synonyms. Prefer `to view your ad performance` over `to see how your ads perform`: `view` is the approved
term ([core action verbs](verbs.md)), it takes a noun, and the noun form is shorter.

**The description must never restate the title.** That redundancy is what case 2 exists to fix:

|     | Title                           | Description                                              |
| --- | ------------------------------- | -------------------------------------------------------- |
| ❌  | `No ad campaigns yet`           | `Your ad campaign list will appear here.` — adds nothing |
| ✅  | `Ad campaigns will appear here` | `Connect Meta Ads Manager to view your ad performance.`  |

**Do not point at a button.** Naming the action is right (`Create your first WhatsApp campaign`); naming
the button label is not (`Add an email account from the **Add email** button.`) — the button is already on
screen, so the pointer costs a line and returns nothing. Several integration blank states still carry the
old button pointer and are due a rewrite.

**Search and filter:**

| Scenario         | 🇺🇸 EN                                                                                           | 🇮🇩 ID                                                                                            | 🇧🇷 PT-BR                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| No search result | "[keyword]" not found<br>Recheck the keywords you have typed and try searching again.           | "[keyword]" tidak ditemukan<br>Periksa kembali kata kunci yang Anda ketik dan coba cari lagi.    | "[keyword]" não encontrado<br>Verifique as palavras-chave digitadas e tente pesquisar novamente.          |
| No filter result | No [Object] match your filters<br>Recheck the filters you have applied and try filtering again. | [Object] tidak sesuai filter Anda<br>Periksa kembali filter yang Anda terapkan dan filter ulang. | Nenhum [Object] corresponde aos seus filtros<br>Verifique os filtros aplicados e tente filtrar novamente. |

### Error and access states

| Scenario                    | 🇺🇸 EN                                                                                                                                            | 🇮🇩 ID                                                                                                                              | 🇧🇷 PT-BR                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 401 — not signed in         | Access for this page only for users<br>Please sign in again or contact your admin for access.                                                    | Halaman ini hanya untuk pengguna<br>Silakan masuk kembali atau hubungi admin Anda untuk mendapatkan akses.                         | Esta página é exclusiva para usuários<br>Entre novamente ou fale com seu administrador para obter acesso.                                                          |
| 403 — no permission         | You do not have access to this page<br>Contact your admin or our support team to access this page.                                               | Anda tidak memiliki akses ke halaman ini<br>Hubungi admin atau tim dukungan kami untuk mengakses halaman ini.                      | Você não tem acesso a esta página<br>Fale com seu administrador ou com nossa equipe de suporte.                                                                    |
| 404 — page not found        | Page not found<br>Recheck the URL or try again later.<br>**CTA:** Back to Home                                                                   | Halaman tidak ditemukan<br>Periksa kembali URL atau coba lagi nanti.<br>**CTA:** Kembali ke Beranda                                | Página não encontrada<br>Verifique o URL ou tente novamente mais tarde.<br>**CTA:** Voltar ao início                                                               |
| 429 — high server load      | Unable to process your request<br>Please wait a moment or reload the page to try again.<br>**CTA:** Reload page                                  | Permintaan Anda tidak dapat diproses<br>Tunggu sebentar atau muat ulang halaman untuk mencoba lagi.<br>**CTA:** Muat ulang halaman | Não foi possível processar sua solicitação<br>Aguarde um momento ou recarregue a página para tentar novamente.<br>**CTA:** Recarregar página                       |
| 500 — server error          | Unable to process your request<br>Please reload this page or try again later.<br>**CTA:** Reload page                                            | Permintaan Anda tidak dapat diproses<br>Silakan muat ulang halaman ini atau coba lagi nanti.<br>**CTA:** Muat ulang halaman        | Não foi possível processar sua solicitação<br>Recarregue esta página ou tente novamente mais tarde.<br>**CTA:** Recarregar página                                  |
| Link expired                | Link has expired<br>You can request a new link to get access.                                                                                    | Tautan telah kedaluwarsa<br>Anda dapat meminta tautan baru untuk mendapatkan akses.                                                | Link expirado<br>Você pode solicitar um novo link para obter acesso.                                                                                               |
| Maintenance                 | This website is under maintenance<br>Sorry for the inconvenience, we will be back in a few moments.                                              | Website ini sedang dalam pemeliharaan<br>Mohon maaf atas ketidaknyamanannya, kami akan kembali dalam beberapa saat.                | Este site está em manutenção<br>Pedimos desculpas pelo inconveniente, voltaremos em breve.                                                                         |
| Request failed (user error) | Unable to process your request<br>Please check your information and try again. If the problem persists, contact our support team for assistance. | Permintaan Anda tidak dapat diproses<br>Periksa informasi Anda dan coba lagi. Jika masalah berlanjut, hubungi tim dukungan kami.   | Não foi possível processar sua solicitação<br>Verifique suas informações e tente novamente. Se o problema persistir, entre em contato com nossa equipe de suporte. |
| Request failed (timeout)    | Failed to process your request<br>Your request takes too long to process. Please reload this page or try again later.                            | Permintaan Anda gagal diproses<br>Permintaan Anda membutuhkan waktu terlalu lama. Muat ulang halaman atau coba lagi nanti.         | Falha ao processar sua solicitação<br>Sua solicitação demorou muito. Recarregue a página ou tente novamente mais tarde.                                            |

### Coachmark

Points at something that has just changed, most often a renamed menu or feature.

| Scenario     | 🇺🇸 EN                                                       | 🇮🇩 ID                                                                   | 🇧🇷 PT-BR                                                            |
| ------------ | ----------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Renamed item | `[Old name] renamed`<br>`[Old name] name is now [new name]` | `[Old name] berganti nama`<br>`Nama [Old name] kini menjadi [new name]` | `[Old name] renomeado`<br>`O nome de [Old name] agora é [new name]` |

Dismiss label: `OK, got it` / `Oke, mengerti` / `Ok, entendi` — see [verbs.md](verbs.md).

### OTP

| Scenario          | 🇺🇸 EN                                | 🇮🇩 ID                                       | 🇧🇷 PT-BR                             |
| ----------------- | ------------------------------------ | ------------------------------------------- | ------------------------------------ |
| Resend (inactive) | Did not receive OTP? Resend in 01:29 | Tidak menerima OTP? Kirim ulang dalam 01:29 | Não recebeu o OTP? Reenviar em 01:29 |
| Resend (active)   | Resend OTP                           | Kirim ulang OTP                             | Reenviar OTP                         |
| Expiry            | OTP will expire in 01:29             | Masa berlaku OTP akan habis dalam 01:29     | O OTP expirará em 01:29              |

---

## Data display

### Badge (status)

Badge terms take an initial capital — this is the one place a mid-phrase capital is correct.

**Max 2 words.** A badge sits in a table cell or beside a title, so it has no room to grow and no room to
wrap. If the status needs three words, the status is doing too much.

| 🇺🇸 EN             | 🇮🇩 ID                | 🇧🇷 PT-BR             |
| ----------------- | -------------------- | -------------------- |
| Active            | Aktif                | Ativo                |
| Inactive          | Tidak aktif          | Inativo              |
| Approved          | Disetujui            | Aprovado             |
| Rejected          | Ditolak              | Rejeitado            |
| Awaiting approval | Menunggu persetujuan | Aguardando aprovação |
| Awaiting payment  | Menunggu pembayaran  | Aguardando pagamento |
| Paid              | Dibayar              | Pago                 |
| Paid off          | Lunas                | Quitado              |
| Overdue           | Telat bayar          | Atrasado             |
| Not processed     | Belum diproses       | Não processado       |
| In progress       | Dalam proses         | Em andamento         |
| Processing        | Diproses             | Em processamento     |
| Canceled          | Dibatalkan           | Cancelado            |
| Completed         | Selesai              | Concluído            |
| Unassigned        | Belum ditugaskan     | Não atribuído        |
| Assigned          | Ditugaskan           | Atribuído            |
| Open              | Terbuka              | Aberto               |
| Resolved          | Diselesaikan         | Resolvido            |
| Pending           | Menunggu             | Pendente             |

### Timeline

An ordered record of what happened to an object, so every entry is **past tense**.

| Part                  | Rule                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Label                 | `[Status] by [Username]`. Past tense. No period. Max 40 characters excluding the username |
| Emphasis              | Status and username in bold; the rest plain                                               |
| Date, full page       | `[D Month YYYY] at [HH:MM] (GMT+7)`                                                       |
| Date, drawer or modal | `[D Abbr-Month YYYY], [HH:MM] (GMT+7)`                                                    |

Month and day abbreviations follow [numbers-and-time.md](numbers-and-time.md).

## Navigation

### Tabs

| Property    | Rule                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| Max words   | 3. The exception is a label the user typed themselves                   |
| Case        | Sentence case                                                           |
| Punctuation | No period, no exclamation mark                                          |
| Vocabulary  | Noun phrase. Never imperative — a tab is a place, not an action         |
| Consistency | The same concept keeps the same label across every screen that shows it |
| Truncation  | Never abbreviate or truncate. If it does not fit, the label is too long |

### Stepper

| Property    | Rule          |
| ----------- | ------------- |
| Max words   | 3             |
| Case        | Sentence case |
| Punctuation | No period     |

Vocabulary depends on how many steps there are:

- **3 steps or fewer** — noun phrase. `Details`, `Recipients`, `Review`
- **More than 3** — imperative. `Add details`, `Choose recipients`, `Review and send`

**Never mix the two in one stepper.** A flow that reads `Details` → `Choose recipients` → `Review` makes
the user re-parse the pattern at every step.

### Breadcrumbs

Each label matches the title of the page or section it points to, exactly. The current page is not shown.

| Property    | Rule                              |
| ----------- | --------------------------------- |
| Max words   | 3 to 4, matching the page title   |
| Case        | Sentence case                     |
| Punctuation | No period or trailing punctuation |
| Vocabulary  | Noun phrase                       |
| Truncation  | Never                             |

When the page title is imperative, the breadcrumb takes the noun form:

| Page title       | Breadcrumb         |
| ---------------- | ------------------ |
| `Create product` | `Product creation` |
| `Edit contact`   | `Contact editing`  |

If the previous page has tabs, use the label of the tab the user was on.
