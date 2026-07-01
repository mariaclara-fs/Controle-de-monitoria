"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase";

export default function Perfil() {
  const router = useRouter();

  const [menuAberto, setMenuAberto] = useState(false);

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");

  const [userId, setUserId] = useState("");

  useEffect(() => {
    buscarUsuario();
  }, []);

  async function buscarUsuario() {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    setUserId(user.id);
    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("profiles")
      .select("nome, matricula")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      alert("Erro ao carregar dados");
      return;
    }

    setNome(data.nome);
    setMatricula(String(data.matricula));
  }

  async function handleSalvar() {
    const nomeValido = /^[A-Za-zÀ-ÿ\s]+$/.test(nome);

    if (!nomeValido || nome.length < 3) {
      alert("Nome inválido");
      return;
    }

    const matriculaValida = /^\d{11}$/.test(matricula);

    if (!matriculaValida) {
      alert("A matrícula deve conter 11 números");
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
      alert("Digite um email válido");
      return;
    }

    const { data: matriculaExistente } = await supabase
      .from("profiles")
      .select("id")
      .eq("matricula", matricula)
      .neq("id", userId)
      .single();

    if (matriculaExistente) {
      alert("Esta matrícula já está em uso");
      return;
    }

    const { error: authError } = await supabase.auth.updateUser({
      email: email
    });

    if (authError) {
      alert("Este email já está em uso ou é inválido");
      console.log(authError);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        nome: nome,
        matricula: Number(matricula)
      })
      .eq("id", userId);

    if (profileError) {
      alert("Erro ao atualizar perfil");
      console.log(profileError);
      return;
    }

    alert("Dados atualizados com sucesso!");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <header className="bg-[#166534] text-white">
        <div className="w-full px-6 py-2.5 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <img
              src="/Logo_RDM.png"
              alt="Rede de Monitoria"
              className="w-9 h-9 rounded"
            />

            <h1 className="font-bold text-lg">
              Rede de Monitoria
            </h1>
          </div>

          <h1 className="text-xl md:text-2xl font-bold">
            Meu Perfil
          </h1>

          <div className="relative">

            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="w-9 h-9 rounded-full border border-white flex items-center justify-center hover:bg-white hover:text-[#166534] transition-all duration-200 cursor-pointer"
            >
              <i className="fa-solid fa-user"></i>
            </button>

            {menuAberto && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg overflow-hidden z-50">

                <Link
                  href="/home_aluno"
                  className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <i className="fa-solid fa-house"></i>
                  Início
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-gray-100 cursor-pointer"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                  Sair
                </button>

              </div>
            )}

          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">

        <div className="bg-white w-full max-w-xl rounded-xl shadow-sm p-8">

          <h2 className="text-2xl font-bold text-gray-800 mb-8">
            Editar informações
          </h2>

          <div className="flex flex-col gap-5">

            <div>
              <label className="block mb-2">
                Nome
              </label>

              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block mb-2">
                Matrícula
              </label>

              <input
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="block mb-2">
                Email
              </label>

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-green-600"
              />
            </div>

            <button
              onClick={handleSalvar}
              className="bg-[#166534] text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition cursor-pointer"
            >
              Salvar alterações
            </button>

          </div>

        </div>

      </main>

      <footer className="bg-[#166534] text-white text-center text-xs py-2.5">
        &copy; 2026 - Rede de Monitoria. Todos os direitos reservados.
      </footer>

    </div>
  );
}