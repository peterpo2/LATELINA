using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using AIPharm.Core.Interfaces;
using AIPharm.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AIPharm.Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IRepository<User> _userRepository;

        public UsersController(IRepository<User> userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userRepository.GetAllAsync();

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");
            var isStaff = User.IsInRole("Staff");

            var filtered = users
                .Where(u =>
                    isAdmin ||
                    (!u.IsAdmin && !u.IsStaff) ||
                    (isStaff && string.Equals(u.Id, currentUserId, StringComparison.Ordinal)))
                .OrderByDescending(u => u.CreatedAt)
                .Select(MapToResponse);

            return Ok(new
            {
                success = true,
                users = filtered
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");
            var isStaff = User.IsInRole("Staff");

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            if (!isAdmin)
            {
                if (isStaff)
                {
                    if (user.IsAdmin || (user.IsStaff && !string.Equals(user.Id, currentUserId, StringComparison.Ordinal)))
                    {
                        return Forbid();
                    }
                }
                else if (!string.Equals(currentUserId, id, StringComparison.Ordinal))
                {
                    return Forbid();
                }
            }

            return Ok(new
            {
                success = true,
                user = MapToResponse(user)
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed",
                    errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                });
            }

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");
            var isStaff = User.IsInRole("Staff");
            var editingSelf = string.Equals(currentUserId, id, StringComparison.Ordinal);

            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found" });
            }

            if (!isAdmin)
            {
                if (isStaff)
                {
                    if (user.IsAdmin || (user.IsStaff && !editingSelf))
                    {
                        return Forbid();
                    }

                    if (request.IsAdmin.HasValue || request.IsStaff.HasValue || request.IsDeleted.HasValue)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "Staff members cannot modify administrative flags or deactivate accounts."
                        });
                    }
                }
                else
                {
                    if (!editingSelf)
                    {
                        return Forbid();
                    }

                    if (request.IsAdmin.HasValue || request.IsDeleted.HasValue || request.IsStaff.HasValue)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "You are not allowed to update administrative flags."
                        });
                    }

                    if (!string.IsNullOrWhiteSpace(request.Email) && !string.Equals(request.Email.Trim(), user.Email, StringComparison.OrdinalIgnoreCase))
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "You are not allowed to change your email address."
                        });
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var trimmedEmail = request.Email.Trim();
                var emailAttribute = new EmailAddressAttribute();
                if (!emailAttribute.IsValid(trimmedEmail))
                {
                    return BadRequest(new { success = false, message = "Invalid email address format." });
                }

                var existingUser = await _userRepository.FirstOrDefaultAsync(u => u.Email == trimmedEmail && u.Id != user.Id);
                if (existingUser != null)
                {
                    return Conflict(new { success = false, message = "A user with this email already exists." });
                }

                user.Email = trimmedEmail;
            }

            if (request.FullName != null)
            {
                var sanitized = request.FullName.Trim();
                user.FullName = string.IsNullOrWhiteSpace(sanitized) ? null : sanitized;
            }

            if (request.PhoneNumber != null)
            {
                var sanitized = request.PhoneNumber.Trim();
                user.PhoneNumber = string.IsNullOrWhiteSpace(sanitized) ? null : sanitized;
            }

            if (request.Address != null)
            {
                var sanitized = request.Address.Trim();
                user.Address = string.IsNullOrWhiteSpace(sanitized) ? null : sanitized;
            }

            if (isAdmin)
            {
                if (request.IsAdmin.HasValue)
                {
                    user.IsAdmin = request.IsAdmin.Value;
                }

                if (request.IsStaff.HasValue)
                {
                    user.IsStaff = request.IsStaff.Value;
                }

                if (request.IsDeleted.HasValue)
                {
                    user.IsDeleted = request.IsDeleted.Value;
                }
            }

            await _userRepository.UpdateAsync(user);

            return Ok(new
            {
                success = true,
                message = "User updated successfully.",
                user = MapToResponse(user)
            });
        }

        private static object MapToResponse(User user) => new
        {
            id = user.Id,
            email = user.Email,
            fullName = user.FullName,
            phoneNumber = user.PhoneNumber,
            address = user.Address,
            isAdmin = user.IsAdmin,
            isStaff = user.IsStaff,
            isDeleted = user.IsDeleted,
            createdAt = user.CreatedAt.ToString("o")
        };
    }

    public class UpdateUserRequest
    {
        [EmailAddress]
        public string? Email { get; set; }

        [MaxLength(150)]
        public string? FullName { get; set; }

        [MaxLength(30)]
        public string? PhoneNumber { get; set; }

        [MaxLength(250)]
        public string? Address { get; set; }

        public bool? IsAdmin { get; set; }

        public bool? IsStaff { get; set; }

        public bool? IsDeleted { get; set; }
    }
}
