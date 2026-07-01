import { supabase } from "./supabase";
import { Material } from "@/types/material";

export async function listarMateriais(disciplinaId?: string) {
  const query = supabase.from("materiais").select("*").order("title", { ascending: true });

  if (disciplinaId) {
    query.eq("disciplina_id", disciplinaId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data as Material[];
}

export async function criarMaterial(disciplinaId: string, title: string, link: string) {
  const { error } = await supabase.from("materiais").insert({
    disciplina_id: disciplinaId,
    title,
    link,
  });

  if (error) {
    throw error;
  }
}

export async function atualizarMaterial(id: string, title: string, link: string) {
  const { error } = await supabase.from("materiais").update({
    title,
    link,
  }).eq("id", id);

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

export async function buscarMaterialPorId(id: string) {
  const { data, error } = await supabase.from("materiais").select("*").eq("id", id).single();

  if (error) {
    throw error;
  }

  return data as Material;
}
