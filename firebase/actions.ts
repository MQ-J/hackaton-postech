import { auth } from '@/firebase/config';
import { firebaseAuthErrorMessage } from '@/lib/firebase-auth-messages';
import { FirebaseError } from 'firebase/app';
import { CompleteFn, ErrorFn, NextOrObserver, onAuthStateChanged, signOut, Unsubscribe, User } from "firebase/auth";

/**
 * Realiza o encerramento da sessão do usuário autenticado.
 *
 * Executa o processo de logout utilizando a instância de autenticação
 * configurada na aplicação.
 *
 * @returns {Promise<void>} Promise resolvida após a finalização do logout.
 */
export async function signOutSection() {
    return await signOut(auth)
}


/**
 * Monitora alterações no estado de autenticação do usuário.
 *
 * O callback informado será executado sempre que ocorrer mudança
 * no estado da autenticação, como login, logout ou atualização da sessão.
 *
 * @param {NextOrObserver<User>} nextOrObserver - Função ou observer executado quando o estado de autenticação for alterado.
 * @param {ErrorFn} [error] - Função executada em caso de erro durante a observação.
 * @param {CompleteFn} [completed] - Função executada quando a observação for finalizada.
 *
 * @returns {Unsubscribe} Função responsável por cancelar a inscrição do listener.
 */
export function onAuthStateChangedListener(nextOrObserver: NextOrObserver<User>, error?: ErrorFn, completed?: CompleteFn): Unsubscribe {
    return onAuthStateChanged(auth, nextOrObserver, error, completed)
}

/**
 * Converte erros de autenticação em mensagens amigáveis para exibição ao usuário.
 *
 * Quando o erro for uma instância de `FirebaseError`, a mensagem será
 * obtida a partir do código retornado pelo Firebase. Caso contrário,
 * será utilizada uma mensagem padrão.
 *
 * @param {unknown} err - Erro retornado durante o processo de autenticação.
 *
 * @returns {string} Mensagem formatada para exibição ao usuário.
 */
export function conectionErrorMessage(err: unknown): string {
    return err instanceof FirebaseError
        ? firebaseAuthErrorMessage(err.code, 'login')
        : 'Não foi possível entrar. Tente novamente.'
}