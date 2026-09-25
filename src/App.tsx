import { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [errore, setErrore] = useState('');
  const [tasks, setTasks] = useState<{ id: number; titolo: string }[]>([]);
  const [nuovoTitolo, setNuovoTitolo] = useState('');
  const [taskInModifica, setTaskInModifica] = useState<number | null>(null);
const [titoloModificato, setTitoloModificato] = useState('');
const [modalitaRegistrazione, setModalitaRegistrazione] = useState(false);
const [nome, setNome] = useState('');
const [ripetiPassword, setRipetiPassword] = useState('');

  async function handleLogin() {
    setErrore('');

    try {
      const risposta = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!risposta.ok) {
        setErrore('Credenziali non valide');
        return;
      }

      const dati = await risposta.json();
      localStorage.setItem('token', dati.token);
      setToken(dati.token);
    } catch {
      setErrore('Errore di connessione al server');
    }
  }

  function logout() {
  localStorage.removeItem('token');
  setToken('');
  setTasks([]);
}

  async function caricaTasks() {
    const risposta = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!risposta.ok) {
      setErrore('Impossibile caricare i task');
      return;
    }

    const dati = await risposta.json();
    setTasks(dati);
  }

  useEffect(() => {
  if (token) {
    caricaTasks();
  }
}, [token]);

async function creaTask() {
  if (!nuovoTitolo.trim()) return;

  const risposta = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ titolo: nuovoTitolo })
  });

  if (!risposta.ok) {
    setErrore('Impossibile creare il task');
    return;
  }

  const taskCreato = await risposta.json();
  setTasks([...tasks, taskCreato]);
  setNuovoTitolo('');
}

async function eliminaTask(id: number) {
  const risposta = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!risposta.ok) {
    setErrore('Impossibile eliminare il task');
    return;
  }

  setTasks(tasks.filter((task) => task.id !== id));
}

async function salvaModifica(id: number) {
  const risposta = await fetch(`${import.meta.env.VITE_API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ titolo: titoloModificato })
  });

  if (!risposta.ok) {
    setErrore('Impossibile modificare il task');
    return;
  }

  const taskAggiornato = await risposta.json();
  setTasks(tasks.map((t) => (t.id === id ? taskAggiornato : t)));
  setTaskInModifica(null);
}

async function handleRegister() {
  setErrore('');

  if (password !== ripetiPassword) {
    setErrore('Le password non coincidono');
    return;
  }

  try {
    const risposta = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, password })
    });

    if (!risposta.ok) {
      const dati = await risposta.json();
      if (dati.errori) {
        setErrore(dati.errori[0].message);
      } else {
        setErrore('Registrazione fallita: email già in uso?');
      }
      return;
    }

    setErrore('');
    setModalitaRegistrazione(false);
    alert('Registrazione completata! Ora puoi fare login.');
  } catch {
    setErrore('Errore di connessione al server');
  }
}
  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors';
  const primaryBtnClass =
    'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const secondaryBtnClass =
    'rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors';
  const dangerBtnClass =
    'rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors';
  const linkBtnClass =
    'text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors';

  function handleFormKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (modalitaRegistrazione) {
        handleRegister();
      } else {
        handleLogin();
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-8">
        <h1 className="text-xl font-semibold text-slate-800 sm:text-2xl">Task Manager</h1>
        {token && (
          <button
            onClick={logout}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Logout
          </button>
        )}
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12">
        {errore && (
          <div className="mb-6 flex w-full max-w-md items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 shadow-sm">
            <svg
              className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm">{errore}</p>
          </div>
        )}

        {token && !errore && (
          <div className="mb-6 flex w-full max-w-md items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 shadow-sm">
            <svg
              className="h-5 w-5 shrink-0 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <p className="text-sm">Login riuscito!</p>
          </div>
        )}

        {!token && (
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <h2 className="mb-6 text-center text-lg font-semibold text-slate-800">
              {modalitaRegistrazione ? 'Registrati' : 'Login'}
            </h2>

            <div className="flex flex-col gap-4">
              {modalitaRegistrazione && (
                <input
                  type="text"
                  placeholder="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={handleFormKeyDown}
                  className={inputClass}
                />
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleFormKeyDown}
                className={inputClass}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleFormKeyDown}
                className={inputClass}
              />

              {modalitaRegistrazione && (
                <input
                  type="password"
                  placeholder="Ripeti password"
                  value={ripetiPassword}
                  onChange={(e) => setRipetiPassword(e.target.value)}
                  onKeyDown={handleFormKeyDown}
                  className={inputClass}
                />
              )}

              <button
                onClick={modalitaRegistrazione ? handleRegister : handleLogin}
                className={primaryBtnClass}
              >
                {modalitaRegistrazione ? 'Registrati' : 'Login'}
              </button>
            </div>

            <p className="mt-5 text-center">
              <button
                onClick={() => {
                  setModalitaRegistrazione(!modalitaRegistrazione);
                  setErrore('');
                  setRipetiPassword('');
                }}
                className={linkBtnClass}
              >
                {modalitaRegistrazione ? 'Hai già un account? Login' : 'Non hai un account? Registrati'}
              </button>
            </p>
          </div>
        )}

        {token && (
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">I miei task</h2>

            <div className="mb-6 flex gap-2">
              <input
                type="text"
                placeholder="Nuovo task"
                value={nuovoTitolo}
                onChange={(e) => setNuovoTitolo(e.target.value)}
                className={inputClass}
              />
              <button onClick={creaTask} className={`${primaryBtnClass} shrink-0`}>
                Aggiungi
              </button>
            </div>

            {tasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Nessun task presente.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition-shadow hover:shadow-sm"
                  >
                    {taskInModifica === task.id ? (
                      <>
                        <input
                          type="text"
                          value={titoloModificato}
                          onChange={(e) => setTitoloModificato(e.target.value)}
                          className={`${inputClass} flex-1`}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => salvaModifica(task.id)} className={primaryBtnClass}>
                            Salva
                          </button>
                          <button onClick={() => setTaskInModifica(null)} className={secondaryBtnClass}>
                            Annulla
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="break-all text-sm text-slate-800">{task.titolo}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setTaskInModifica(task.id);
                              setTitoloModificato(task.titolo);
                            }}
                            className={secondaryBtnClass}
                          >
                            Modifica
                          </button>
                          <button onClick={() => eliminaTask(task.id)} className={dangerBtnClass}>
                            Elimina
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;