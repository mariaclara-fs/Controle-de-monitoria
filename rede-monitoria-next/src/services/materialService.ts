import { supabase } from "./supabase";

export async function listarMateriais(disciplinaId: string) {
  const { data, error } = await supabase
    .from("materiais")
    .select("*")
    .eq("turma_id", disciplinaId)
    .order("titulo");

  if (error) {
    throw error;
  }

  return data;
}

export async function criarMaterial(disciplinaId: string, title: string, link: string) {
  const { error } = await supabase
    .from("materiais")
    .insert([
      { 
        turma_id: disciplinaId, 
        titulo: title,          
        arquivo_url: link // <<< Ajustado para 'arquivo_url' conforme o seu banco!
      }
    ]);

  if (error) {
    throw error;
  }
}

export async function atualizarMaterial(id: string, title: string, link: string) {
  const { error } = await supabase
    .from("materiais")
    .update({ 
      titulo: title, 
      arquivo_url: link // <<< Ajustado para 'arquivo_url' aqui também!
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}

export async function deletarMaterial(id: string) {
  const { error } = await supabase.from("materiais").delete().eq("id", id);

  if (error) {
    throw error;
  }
}