import { Button } from '@/components/ui/button';

function SignIn() {
    return (
        <div>
            <h1>Sign up for Komyut!</h1>
            <form>
                <label>Create Account Name</label>
                <input type="text" name="accountName" placeholder="ex. Juan Dela Cruz" />
                
                <label>Create Username</label>
                <input type="text" name="username" />
                
                    <label>Create Password</label>
                    <input type="password" name="password" />
                    
                    <label>Confirm Password:</label>
                    <input type="password" name="confirmPassword" />
                    
                    <Button type="submit">Sign Up</Button>
            </form>
        </div>
    );
}

export default SignIn;
