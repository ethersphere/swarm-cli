;;; GNU Guix --- Functional package management for GNU
;;; Copyright © 2021, 2022 Attila Lendvai <attila@lendvai.name>
;;;
;;; This file is part of GNU Guix.
;;;
;;; GNU Guix is free software; you can redistribute it and/or modify it
;;; under the terms of the GNU General Public License as published by
;;; the Free Software Foundation; either version 3 of the License, or (at
;;; your option) any later version.
;;;
;;; GNU Guix is distributed in the hope that it will be useful, but
;;; WITHOUT ANY WARRANTY; without even the implied warranty of
;;; MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
;;; GNU General Public License for more details.
;;;
;;; You should have received a copy of the GNU General Public License
;;; along with GNU Guix.  If not, see <http://www.gnu.org/licenses/>.


;; Note that this file is half-baked: it's enough for `guix shell`,
;; but it's not detailed enough to build/install the package using Guix.

;; To enter a shell with the necessary dependencies for development:
;;   guix shell
;;
;; To build and install:
;;   guix package -f guix.scm
;;
;; To build it, but not install it:
;;   guix build -f guix.scm
;;

(use-modules
 (gnu packages node)
 (git)
 (guix build-system node)
 (guix gexp)
 (guix git)
 (guix git-download)
 ((guix licenses) #:prefix license:)
 (guix packages))

(define *source-dir* (dirname (current-filename)))

(define *with-worktree-changes* #false)

(define (latest-git-commit-hash dir)
  (with-repository dir repo
    (oid->string (object-id (revparse-single repo "HEAD")))))

(package
  (name "swarm-cli")
  (version "dev")
  (source (if *with-worktree-changes*
              (local-file *source-dir*
                          #:recursive? #t
                          #:select? (git-predicate *source-dir*))
              (git-checkout (url *source-dir*)
                            (branch "master"))))
  (build-system node-build-system)
  (home-page "https://github.com/ethersphere/swarm-cli")
  (synopsis "")
  (description "")
  (license license:bsd-3))
