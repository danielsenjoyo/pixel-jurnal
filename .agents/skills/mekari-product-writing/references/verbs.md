# Core action verbs

### Core action verbs

| EN            | ID                         | PT-BR                  | When to use                                                                                      |
| ------------- | -------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| Add           | Tambah                     | Adicionar              | Including an item into an existing context. Pair with **Remove** or **Delete**.                  |
| Create        | Buat                       | Criar                  | Making something from scratch. Pair with **Delete**.                                             |
| Delete        | Hapus                      | Excluir                | Permanent deletion from backend, cannot be recovered. Pair with **Create**.                      |
| Remove        | Hapus                      | Remover                | Non-permanent. Removes from view or list without deleting from the system. Pair with **Add**.    |
| Edit          | Ubah                       | Editar                 | Changing something already saved. Common in settings.                                            |
| Save          | Simpan                     | Salvar                 | Saving a new file or creation. Can append an object: "Save draft".                               |
| Save changes  | Simpan perubahan           | Salvar alterações      | Saving edits to existing data (form, settings, transaction).                                     |
| Submit        | Kirim                      | Enviar                 | Completing a task that cannot be edited after (e.g. activation form).                            |
| Send          | Kirim                      | Enviar                 | Sending to a receiver. The user expects a reply or conversation.                                 |
| Approve       | Setujui                    | Aprovar                | Approving a request. Pair with **Reject**.                                                       |
| Reject        | Tolak                      | Rejeitar               | Rejecting a request. Pair with **Approve**.                                                      |
| Cancel        | Batalkan                   | Cancelar               | Aborting or stopping an action the user initiated.                                               |
| Close         | Tutup                      | Fechar                 | Dismissing a screen without affecting data. Not reversible.                                      |
| Back          | Kembali                    | Voltar                 | Going back during a process with a final action at the end.                                      |
| Previous      | Kembali                    | Anterior               | Going back in onboarding or product tour (no final action needed).                               |
| Next          | Lanjut                     | Próximo                | Moving forward in onboarding or product tour.                                                    |
| Continue      | Lanjutkan                  | Continuar              | Moving forward in a multi-step form (e.g. KYC).                                                  |
| Proceed       | Lanjutkan                  | Prosseguir             | Moving forward in a prompt or confirmation.                                                      |
| Done          | Selesai                    | Concluído              | Saving a selection in a modal or drawer without triggering a success toast.                      |
| Clear         | Hapus                      | Limpar                 | Clearing selected checkboxes. Can append: "Clear selections".                                    |
| Reset         | Reset                      | Redefinir              | Reverting filter or settings to default. Can append: "Reset filter".                             |
| View          | Lihat                      | Visualizar             | Opening a standalone object (same or new tab).                                                   |
| View details  | Lihat detail               | Ver detalhes           | Drilling into more info.                                                                         |
| Show          | Tampilkan                  | Mostrar                | Revealing hidden or hashed data (password, balance). Pair with **Hide**.                         |
| Hide          | Sembunyikan                | Ocultar                | Hiding shown data. Pair with **Show**.                                                           |
| Show more     | Tampilkan lebih banyak     | Mostrar mais           | Expanding truncated content. Pair with **Show less**.                                            |
| Show less     | Tampilkan lebih sedikit    | Mostrar menos          | Collapsing expanded content. Pair with **Show more**.                                            |
| Load more     | Muat lebih banyak          | Carregar mais          | Loading more data (replaces infinite scroll).                                                    |
| Learn more    | Pelajari lebih lanjut      | Saiba mais             | Redirecting to another page (same or new tab).                                                   |
| Get more info | Dapatkan info lebih lanjut | Obter mais informações | Redirecting to a dedicated page with complete info. Opens a new tab.                             |
| Download      | Download                   | Download               | Saving a finalized or packaged file from online to local.                                        |
| Export        | Ekspor                     | Exportar               | Downloading a filtered table selection.                                                          |
| Upload        | Upload                     | Upload                 | Loading a file from local to online. Can be nested under Import.                                 |
| Import        | Impor                      | Importar               | Multi-step data addition usually involving a template. Contains Upload.                          |
| Install       | Instal                     | Instalar               | Installing an integration or add-on.                                                             |
| Sync          | Sinkronkan                 | Sincronizar            | Synchronizing data between devices.                                                              |
| Upgrade       | Tingkatkan                 | Fazer upgrade          | Upgrading a package or usage tier.                                                               |
| Update        | Perbarui                   | Atualizar              | Refreshing data in a dashboard.                                                                  |
| Reload        | Muat ulang                 | Recarregar             | Reloading a page. Never "refresh".                                                               |
| Respond       | Respons                    | Responder              | Performing an action for signing activities (review, sign, void, decline).                       |
| Review        | Tinjau                     | Revisar                | Previewing an action before save, submit, or send.                                               |
| Set           | Atur                       | Definir                | Making a judgment or configuration.                                                              |
| Sign in       | Sign in / Masuk            | Entrar                 | Entering the app with an existing account. Never "login".                                        |
| Sign out      | Sign out                   | Sair                   | Leaving the account. Never "logout". Stays English in ID.                                        |
| Sign up       | Daftar                     | Cadastrar              | Registering for a new account.                                                                   |
| Top up        | Top up                     | Recarregar             | Adding balance, credit, or quota to an existing account. ID stays English per Mekari convention. |
| Dismiss       | Abaikan                    | Dispensar              | For suggestive or AI-generated info only.                                                        |
| Try again     | Coba lagi                  | Tentar novamente       | Retrying a failed action.                                                                        |
| OK, got it    | Oke, mengerti              | Ok, entendi            | Dismissing a tooltip or coachmark in onboarding.                                                 |
| Later         | Nanti                      | Agora não              | Secondary button in a bottom sheet, postponing an action.                                        |
| Complete      | Lengkapi                   | Completar              | Verb — suggesting the user completes a form.                                                     |
| Completed     | Selesai                    | Concluído              | Adjective — status label.                                                                        |

> **Add vs Create:** "Add" is broader — it works for including existing items and registering new ones
> when the real-world entity already exists ("Add customer", "Add product"). Reserve "Create" for
> objects genuinely built inside the app ("Create deal", "Create template", "Create bot").

> **EN phrasal verb hyphenation:** the verb form stays 2 words; the noun/adjective form is hyphenated.
> Applies to `sign in`, `sign out`, `top up`, `set up`, and any similar phrasal verb.
>
> - Verb: `Sign in to continue`, `Top up your balance`, `Sign out from all devices`, `Set up your channel`
> - Noun/adjective: `sign-in page`, `top-up amount`, `sign-out flow`, `setup guide`
>
> Note `set up` → the noun is `setup` (one word), never `set-up`.
> ID and PT-BR do not need this — they use single words or non-hyphenated forms in both roles.
