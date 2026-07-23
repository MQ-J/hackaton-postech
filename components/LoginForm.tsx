import { useAccount } from "@/contexts/AccountContext";
import { useAuth } from "@/contexts/AuthContext";
import { conectionErrorMessage } from "@/firebase/actions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { z } from 'zod';
import { PrimaryButton } from "./PrimaryButton";
import { TextInputField } from "./TextInputField";

const loginSchema = z.object({
    email: z.string().email({ message: 'Por favor, insira um e-mail válido.' }),
    password: z.string().min(1, { message: 'Por favor, insira a senha.' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
    onSuccess: () => void
}


/**
 * Componente responsável por renderizar o formulário de autenticação do usuário.
 *
 * Realiza validação dos campos utilizando Zod, autentica o usuário,
 * exibe notificações de sucesso/erro e redireciona para a aplicação
 * após login concluído com sucesso.
 *
 * @param {Object} props - Propriedades do componente.
 * @param {() => void} props.onSuccess - Função executada após autenticação realizada com sucesso.
 *
 * @returns {JSX.Element} Formulário de login contendo campos de e-mail, senha e botão de envio.
 */
export function LoginForm({ onSuccess }: LoginFormProps) {
    const { login } = useAccount()
    const { signIn } = useAuth()

    const router = useRouter()

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    async function onSubmit(data: LoginFormValues) {
        const email = data.email.trim()
        try {

            const accountFromFirebase = await signIn(email, data.password)



            Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2:
                    'Login efetuado com sucesso! Você está sendo redirecionado para a home.',
            })
            await login(accountFromFirebase)

            import('@/components/charts/ChartsNative').catch(() => {})
            import('@/components/TransactionForm').catch(() => {})

            setTimeout(() => {
                onSuccess()
                router.replace('/(tabs)' as const)
            }, 500)

        } catch (err) {
            const message = conectionErrorMessage(err)
            Toast.show({
                type: 'error',
                text1: 'Erro ao fazer login',
                text2: message,
            })
        }
    }

    return (
        <View style={{ marginTop: 16 }}>
            <TextInputField
                name="email"
                control={control}
                label="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                error={errors.email}
                placeholder="seu@email.com"
            />
            <TextInputField
                name="password"
                control={control}
                label="Senha"
                secureTextEntry
                autoCapitalize="none"
                icon="lock-closed-outline"
                error={errors.password}
                placeholder="Digite a sua senha"
            />
            <PrimaryButton
                label={isSubmitting ? 'Entrando...' : 'Entrar'}
                onPress={handleSubmit(onSubmit)}
                style={{ marginTop: 12, width: '100%' }}
                disabled={isSubmitting}
                iconName="log-in-outline"
            />
        </View>
    )
}