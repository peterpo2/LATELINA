using System.Security.Cryptography;
using System.Text;

namespace AIPharm.Core.Security
{
    public static class OneTimePasswordGenerator
    {
        public static string GenerateNumericCode(int digits)
        {
            if (digits <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(digits));
            }

            Span<byte> buffer = stackalloc byte[digits];
            RandomNumberGenerator.Fill(buffer);

            var sb = new StringBuilder(digits);
            foreach (var b in buffer)
            {
                sb.Append((char)('0' + (b % 10)));
            }

            return sb.ToString();
        }

        public static string GenerateLoginToken()
        {
            Span<byte> buffer = stackalloc byte[32];
            RandomNumberGenerator.Fill(buffer);
            return Convert.ToBase64String(buffer);
        }
    }
}
