import { savePost } from "../../app/admin/blog/actions";
import { blogCategories, blogCovers } from "../../lib/blog-options.ts";
import type { Post } from "../../lib/blog.ts";
import styles from "../../app/admin/admin.module.css";

export function PostEditor({ post }: { post?: Post }) {
  return <form action={savePost} className={styles.form}>
    <input type="hidden" name="id" value={post?.id || ""} />
    <label>Título<input name="title" defaultValue={post?.title} required minLength={3} maxLength={180} /></label>
    <label>Endereço do artigo<input name="slug" defaultValue={post?.slug} required maxLength={180} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="exemplo-de-artigo" /><small>Use letras minúsculas sem acentos, números e hífens. O endereço será /blog/exemplo-de-artigo.</small></label>
    <label>Categoria<select name="category" defaultValue={post?.category || blogCategories[0]}>{blogCategories.map(category => <option key={category}>{category}</option>)}</select></label>
    <label>Resumo<textarea name="excerpt" defaultValue={post?.excerpt} required minLength={10} maxLength={400} /></label>
    <label>Imagem de capa<select name="cover" defaultValue={post?.cover || blogCovers[0].path}>{blogCovers.map(cover => <option key={cover.path} value={cover.path}>{cover.label}</option>)}</select></label>
    <label>Conteúdo<textarea className={styles.content} name="content" defaultValue={post?.content} required minLength={30} maxLength={100000} /><small>Separe parágrafos com uma linha em branco. Para subtítulos, comece a linha com ##. O conteúdo é exibido como texto seguro, sem HTML.</small></label>
    <label className={styles.checkbox}><input name="published" type="checkbox" defaultChecked={post?.published} /> Publicar no site</label>
    <button>Salvar artigo</button>
  </form>;
}
