using System.Threading;
using System.Threading.Tasks;

namespace Latelina.Core.Interfaces
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string toEmail, string subject, string plainTextBody, CancellationToken cancellationToken = default);
    }
}
